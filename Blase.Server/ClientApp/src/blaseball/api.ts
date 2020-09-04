import { GameUpdate } from "./update";
import { Day } from "./game";
import {useSWRInfinite} from "swr";
import {useEffect} from "react";

export interface GamesResponse {
    days: Day[]
}

export interface GameUpdatesResponse {
    updates: GameUpdate[]
}

export function useGameList(season: number, pageSize: number) {
    function getNextPage(pageIndex: number, previousPageData: GamesResponse | null) {
        let startDay = 999;
        if (previousPageData) {
            const {days} = previousPageData;
            const lastDay = days[days.length-1];
            startDay = lastDay.day - 1;
        }

        if (startDay < 0)
            // at the end! :)
            return null;

        return `/api/games?season=${season-1}&day=${startDay}&dayCount=${pageSize}&reverse=true`
    }

    const { data, size, setSize, error } = useSWRInfinite<GamesResponse>(getNextPage, {
        revalidateOnFocus: false
    });
    
    const days = [];
    for (const page of (data ?? []))
        days.push(...page.days);
    
    return {
        days: data ? days : null, 
        error, 
        pageCount: size,
        nextPage: () => setSize(size + 1)
    }
}

interface GameUpdatesHookReturn {
    updates: GameUpdate[];
    error: any;
    isLoading: boolean;
}

export function useGameUpdates(game: string, autoRefresh: boolean): GameUpdatesHookReturn {
    const pageSize = 100;
    
    // Use faux-pagination, where every "page" (after the first few) is just the updates since the last one
    function getNextPage(pageIndex: number, previousPageData: GameUpdatesResponse | null) {
        if (!previousPageData)
            // First page, fetch all updates so far
            return `/api/games/${game}/updates?count=${pageSize}`;

        const lastUpdate = previousPageData.updates[previousPageData.updates.length - 1];
        if (lastUpdate.payload.gameComplete)
            // If the game's over, there's no more data
            return null;

        return `/api/games/${game}/updates?after=${encodeURIComponent(lastUpdate.timestamp)}&count=${pageSize}`;
    }

    const { data: pages, size, setSize, mutate, error } =
        useSWRInfinite<GameUpdatesResponse>(getNextPage,  {revalidateOnFocus: false});
    
    console.log("got page count: ", pages?.length);
    if (pages)
        console.log("last page: ", pages[pages.length-1].updates.length);

    // Flatten pages to update list
    const updates = [];
    for (const page of (pages ?? []))
        updates.push(...page.updates);
    
    // Handle chunking logic; if we're not "at the end", bump page count after a timeout
    const hasMorePages = (pages != undefined)     
        && pages[pages.length-1].updates.length > 0
        && !updates[updates.length-1].payload.gameComplete;
    
    const shouldLoadNextPage = pages?.length == size && hasMorePages;

    // Handle autorefresh logic
    const shouldQueueRefresh = autoRefresh && pages && pages[pages.length-1].updates.length == 0;
    
    async function doRefreshLastPage() {
        // Cut the last page off, invalidating its cache and causing a refetch
        const newPages = await mutate(pages => pages.slice(0, -1));

        // If we got some data this time, bump to next page so we keep going :)
        if (newPages![newPages!.length - 1].updates.length > 0)
            setSize(size + 1);
    }
    
    // All delayed stuff take place in an effect
    useEffect(() => {
        if (shouldQueueRefresh)
            setTimeout(doRefreshLastPage, 1000);
        if (shouldLoadNextPage)
            setSize(size + 1);
    }, [shouldLoadNextPage, shouldQueueRefresh]);

    return {
        updates: updates,
        isLoading: !pages || hasMorePages,
        error
    }
}
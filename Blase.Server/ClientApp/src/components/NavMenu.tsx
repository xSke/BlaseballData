import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

export function NavMenu() {
  return (
    <div className="py-4 mb-2 bg-gray-200">
      <Container>
        <div className="flex flex-row">
          <div className="flex-1 text-lg font-semibold">Reblase</div>

          <div className="space-x-4">
              <Link to="/season/3" className="hover:underline">Season 3</Link>
              <Link to="/season/4" className="hover:underline">Season 4</Link>
              <Link to="/season/5" className="hover:underline">Season 5</Link>
              <Link to="/season/6" className="hover:underline">Season 6</Link>
              <Link to="/season/7" className="hover:underline">Season 7</Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
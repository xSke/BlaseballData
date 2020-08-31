using System.IO;
using System.Security.Cryptography;

namespace Blase.Core
{
    public class HashingStream: Stream
    {
        private readonly HashAlgorithm _algo;

        public HashingStream(HashAlgorithm algo)
        {
            _algo = algo;
            _algo.Initialize();
        }

        public override void Flush()
        {
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            throw new System.NotImplementedException();
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            throw new System.NotImplementedException();
        }

        public override void SetLength(long value)
        {
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            _algo.TransformBlock(buffer, offset, count, null, 0);
        }

        public byte[] GetHash()
        {
            _algo.TransformFinalBlock(new byte[0], 0, 0);
            return _algo.Hash;
        }

        public override bool CanRead { get; } = false;
        public override bool CanSeek { get; } = false;
        public override bool CanWrite { get; } = true;
        public override long Length { get; } = 0;
        public override long Position { get; set; } = 0;
    }
}
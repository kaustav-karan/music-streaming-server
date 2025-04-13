const crypto = require('crypto');
const base62 = require('base62/lib/ascii');

class TrackIDSystem {
    constructor(bloomFilterSize = 9585059, hashCount = 7) {
        this.trackDB = new Map();
        this.bloomFilter = new BloomFilter(bloomFilterSize, hashCount);
    }

    generateTrackId(trackName, artistName) {
        const uniqueStr = `${trackName.toLowerCase()}|${artistName.toLowerCase()}`;
        const hash = crypto.createHash('sha256').update(uniqueStr).digest();
    
        // Convert buffer to a base62 string (by first converting to a big integer string)
        const num = BigInt('0x' + hash.toString('hex')).toString(); // base 10 string
        const trackId = base62.encode(parseInt(num.substring(0, 15))).substring(0, 8); // keep it safe in JS range
    
        this.trackDB.set(trackId, { name: trackName, artist: artistName });
        this.bloomFilter.add(trackId);
    
        console.log("Track ID generated:", trackId);
        return trackId;
    }    

    lookupTrack(trackId) {
        if (!this.bloomFilter.test(trackId)) {
            return null;
        }
        return this.trackDB.get(trackId) || null;
    }
}

class BloomFilter {
    constructor(size, hashCount) {
        this.size = size;
        this.hashCount = hashCount;
        this.bitSet = new Uint8Array(size);
        this.hashSeeds = Array.from({ length: hashCount }, (_, i) => i * 0x5bd1e995);
    }

    add(item) {
        this.hashSeeds.forEach(seed => {
            const hash = this.murmurHash(item, seed) % this.size;
            this.bitSet[hash] = 1;
        });
    }

    test(item) {
        return this.hashSeeds.every(seed => {
            const hash = this.murmurHash(item, seed) % this.size;
            return this.bitSet[hash] === 1;
        });
    }

    murmurHash(key, seed) {
        const m = 0x5bd1e995;
        const r = 24;
        let h = seed ^ key.length;

        for (let i = 0; i < key.length; i++) {
            let k = key.charCodeAt(i);
            k = Math.imul(k, m);
            k ^= k >>> r;
            k = Math.imul(k, m);

            h = Math.imul(h, m);
            h ^= k;
        }

        h ^= h >>> 13;
        h = Math.imul(h, m);
        h ^= h >>> 15;

        return h >>> 0; // Ensure unsigned 32-bit integer
    }
}

const TrackId = new TrackIDSystem();
module.exports = TrackId;

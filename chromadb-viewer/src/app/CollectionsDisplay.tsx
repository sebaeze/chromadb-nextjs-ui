"use client"; // This directive marks this as a Client Component

import React from 'react';

// Define an interface for the structure of a single collection's metadata
interface CollectionMetadata {
  [key: string]: any; // Metadata can be flexible, so we use an index signature
}

// Define an interface for the structure of a single collection
interface Collection {
  id: string;
  name: string;
  metadata: CollectionMetadata | null; // Metadata can be null
}

interface CollectionsDisplayProps {
  collections: Collection[] | null;
  error: string | null;
}

const CollectionsDisplay: React.FC<CollectionsDisplayProps> = ({ collections, error }) => {
  return (
    <div className="container">
      <main className="main">
        <h1 className="title">
          ChromaDB Collections
        </h1>

        {error && (
          <div className="error">
            <p>Error fetching collections:</p>
            <p>{error}</p>
          </div>
        )}

        {collections && collections.length === 0 && !error && (
          <p>No collections found in ChromaDB.</p>
        )}

        {collections && collections.length > 0 && (
          <ul className="collectionList">
            {collections.map((collection: Collection) => (
              <li key={collection.id} className="collectionItem">
                <h2>{collection.name}</h2>
                <p><strong>ID:</strong> {collection.id}</p>
                {collection.metadata && (
                  <div>
                    <strong>Metadata:</strong>
                    <pre>{JSON.stringify(collection.metadata, null, 2)}</pre>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* styled-jsx remains here in the Client Component */}
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f0f2f5;
          color: #333;
        }
        .main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }
        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 3rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        .error {
          color: red;
          background-color: #ffebee;
          border: 1px solid red;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .collectionList {
          list-style: none;
          padding: 0;
          width: 100%;
        }
        .collectionItem {
          background: #fff;
          border: 1px solid #ddd;
          padding: 1.5rem;
          margin-bottom: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .collectionItem h2 {
          margin-top: 0;
          color: #0070f3;
        }
        .collectionItem pre {
          background-color: #f8f8f8;
          padding: 0.5rem;
          border-radius: 4px;
          overflow-x: auto;
          border: 1px solid #eee;
        }
      `}</style>
    </div>
  );
};

export default CollectionsDisplay;
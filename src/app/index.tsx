import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';

// Define an interface for the structure of a single collection's metadata
interface CollectionMetadata {
  [key: string]: any; // Metadata can be flexible, so we use an index signature
}

// Define an interface for the structure of a single collection
interface Collection {
  id: string;
  name: string;
  metadata: CollectionMetadata | null; // Metadata can be null
  // Add other potential fields from ChromaDB if needed, e.g.:
  // count?: number;
  // tenant?: string;
  // database?: string;
}

// Define an interface for the props of the HomePage component
interface HomePageProps {
  collections: Collection[] | null;
  error: string | null;
}

const HomePage: NextPage<HomePageProps> = ({ collections, error }) => {
  return (
    <div className="container">
      <Head>
        <title>ChromaDB Collections</title>
        <meta name="description" content="List of collections from ChromaDB" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
            {collections.map((collection: Collection) => ( // Explicitly type collection here for clarity, though often inferred
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
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const chromaDBUrl = 'http://localhost:8000';
  const collectionsEndpoint = '/api/v1/collections'; // Standard ChromaDB endpoint

  try {
    const res = await fetch(`${chromaDBUrl}${collectionsEndpoint}`);

    if (!res.ok) {
      let errorMessage = `Failed to fetch collections. Status: ${res.status}`;
      try {
        const errorData = await res.json(); // ChromaDB often returns JSON errors
        if (errorData && errorData.error) {
          // FastAPI/uvicorn error format for Chroma might be {"detail": "message"} or {"error": {"message": "..."}}
          errorMessage += `: ${errorData.error.message || errorData.error.detail || JSON.stringify(errorData.error)}`;
        } else if (errorData && errorData.detail) {
          errorMessage += `: ${errorData.detail}`;
        } else {
          errorMessage += `. Response: ${await res.text()}`;
        }
      } catch (e) {
        // If parsing error JSON fails, use the text response
        errorMessage += `. Response: ${await res.text()}`;
      }
      console.error(errorMessage);
      return { props: { collections: null, error: errorMessage } };
    }

    const collections = await res.json();
    // Ensure the fetched collections match the Collection[] type or handle potential mismatches.
    // For now, we assume the API returns data conforming to the Collection interface.
    return { props: { collections: collections as Collection[], error: null } };
  } catch (error: any) { // Catch block variable type
    console.error('Network or other error fetching collections:', error);
    let friendlyMessage = 'An unexpected error occurred while trying to connect to ChromaDB.';
    // Check for Node.js specific error codes if running in Node environment for fetch
    if (error.cause && (error.cause as any).code === 'ECONNREFUSED') { // More robust check for ECONNREFUSED
      friendlyMessage = `Could not connect to ChromaDB at ${chromaDBUrl}. Please ensure ChromaDB is running and accessible.`;
    } else if (error.message) {
      friendlyMessage += ` Details: ${error.message}`;
    }
    return { props: { collections: null, error: friendlyMessage } };
  }
};

export default HomePage;
import CollectionsDisplay from './CollectionsDisplay'; // Import the new Client Component

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

// This component will now be a Server Component and fetch its own data.
const HomePage = async () => {
  let collections: Collection[] | null = null;
  let error: string | null = null;

  const chromaDBUrl = 'http://localhost:8000';
  // Updated to V2 endpoint based on swagger and common defaults
  const tenantName = 'default_tenant';
  const databaseName = 'default_database';
  const collectionsEndpoint = `/api/v2/tenants/${tenantName}/databases/${databaseName}/collections`;

  try {
    // In App Router, use { cache: 'no-store' } for dynamic data fetching
    const res = await fetch(`${chromaDBUrl}${collectionsEndpoint}`, { cache: 'no-store', headers: { 'accept': 'application/json' } });

    if (!res.ok) {
      let errorMessage = `Failed to fetch collections. Status: ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData && errorData.error) {
          errorMessage += `: ${errorData.error.message || errorData.error.detail || JSON.stringify(errorData.error)}`;
        } else if (errorData && typeof errorData.detail === 'string') {
          errorMessage += `: ${errorData.detail}`;
        } else if (errorData && Array.isArray(errorData.detail) && errorData.detail.length > 0 && errorData.detail[0].msg) {
          errorMessage += `: ${errorData.detail[0].msg}`; // Handle FastAPI validation errors
        } else if (errorData && errorData.detail) { // Fallback for other detail structures
          errorMessage += `: ${errorData.detail}`;
        } else {
          errorMessage += `. Response: ${await res.text()}`;
        }
      } catch (e) {
        errorMessage += `. Response: ${await res.text()}`;
      }
      console.error(errorMessage);
      error = errorMessage;
    } else {
      collections = await res.json() as Collection[];
    }
  } catch (e: any) {
    console.error('Network or other error fetching collections:', e);
    let friendlyMessage = 'An unexpected error occurred while trying to connect to ChromaDB.';
    if (e.cause && (e.cause as any).code === 'ECONNREFUSED') {
      friendlyMessage = `Could not connect to ChromaDB at ${chromaDBUrl}. Please ensure ChromaDB is running and accessible.`;
    } else if (e.message) {
      friendlyMessage += ` Details: ${e.message}`;
    }
    error = friendlyMessage;
  }

  // Render the Client Component and pass the fetched data as props
  return <CollectionsDisplay collections={collections} error={error} />;
}

export default HomePage;
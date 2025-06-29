import CollectionDetail from './CollectionDetail'; // Import the new Client Component
import CollectionErrorDisplay from './CollectionErrorDisplay';

// Define an interface for the structure of a single collection's metadata
interface CollectionMetadata {
  [key: string]: [value: string];
}

// Define an interface for the structure of a single collection
interface Collection {
  id: string;
  name: string;
  metadata: CollectionMetadata | null;
}

// Define an interface for the structure of a single document
interface Document {
  id: string;
  document: string | null;
  metadata: CollectionMetadata | null;
}

interface CollectionPageProps {
  params: {
    id: string;
    name: string;
  };
  searchParams: {
    limit: string | undefined;
  };
}
// This is now an async Server Component for data fetching
const CollectionPage = async ({ params, searchParams }: CollectionPageProps) => {
  const collectionId = params.id;
  const collectionName = params.name;
  const limit = parseInt(searchParams?.limit||"2");

  let collection: Collection | null = null;
  let documents: Document[] | null = null;
  let error: string | null = null;
  let documentsError: string | null = null;
  let collectionCount: number | null = null;

  const chromaDBUrl = 'http://localhost:8000';
  const tenantName = 'default_tenant';
  const databaseName = 'default_database';
  const collectionEndpoint = `/api/v2/tenants/${tenantName}/databases/${databaseName}/collections/${collectionName}`;


  try {
    const res = await fetch(`${chromaDBUrl}${collectionEndpoint}`, 
          { method: 'GET', cache: 'no-store', 
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
          } );

    if (!res.ok) {
        let errorMessage = `Failed to fetch collection "${collectionName}"-"${collectionId}". Status: ${res.status}`;
        try {
            const errorData = await res.json();
            if (errorData && errorData.detail) {
                errorMessage += `: ${errorData.detail}`;
            } else {
                errorMessage += `. Response: ${await res.json()}`;
            }
        } catch (e) {
          console.log("\n\n ERROR: ",e,"\n\n");
            errorMessage += `. Response: ${await res.text()}`;
        }
        console.error(errorMessage);
        error = errorMessage;
    } else {
        collection = await res.json() as Collection;

        // Fetch collection count
        const countEndpoint = `/api/v2/tenants/${tenantName}/databases/${databaseName}/collections/${collection.id}/count`;
        try {
            const countRes = await fetch(`${chromaDBUrl}${countEndpoint}`, {
                method: 'GET',
                cache: 'no-store',
                headers: { 'Accept': 'application/json' },
            });
            if (countRes.ok) {
                collectionCount = await countRes.json();
            } else {
                console.error(`Failed to fetch collection count for "${collectionId}". Status: ${countRes.status}`);
            }
        } catch (countErr: TError) {
            console.error(`Network or other error fetching collection count for "${collectionId}":`, countErr);
        }

        // If collection is fetched successfully, fetch its documents
        // The endpoint to get documents is a POST request.
        const documentsEndpoint = `/api/v2/tenants/${tenantName}/databases/${databaseName}/collections/${collection.id}/get`;
        try {
            const docRes = await fetch(`${chromaDBUrl}${documentsEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Body to get up to 10 documents with their metadata and content
                body: JSON.stringify({ include: ["metadatas", "documents"], limit }),
                cache: 'no-store',
            });

            if (!docRes.ok) {
                let docErrorMessage = `Failed to fetch documents for collection "${collectionId}". Status: ${docRes.status}`;
                // Try to parse error details from the response body
                try {
                    const errorData = await docRes.json();
                    docErrorMessage += `: ${errorData.detail || JSON.stringify(errorData)}`;
                } catch (e:TError) {
                    console.log("\n\n ERROR: ",e,"\n\n");
                    docErrorMessage += `. Response: ${await docRes.text()}`;
                }
                console.error(docErrorMessage);
                documentsError = docErrorMessage;
            } else {
                const data = await docRes.json();
                // The response has separate arrays for ids, documents, metadatas. We need to combine them.
                documents = data.ids.map((id: string, index: number) => ({
                    id: id,
                    document: data.documents?.[index] ?? null,
                    metadata: data.metadatas?.[index] ?? null,
                }));
            }
        } catch (docErr: TError) {
            console.error(`Network or other error fetching documents for collection "${collectionId}":`, docErr);
            documentsError = `An unexpected error occurred while fetching documents. Details: ${docErr.message}`;
        }
    }
  } catch (e: TError) {
    console.error(`Network or other error fetching collection "${collectionId}":`, e);
    let friendlyMessage = `An unexpected error occurred while trying to connect to ChromaDB.`;
    if (e.cause && (e.cause as TError).code === 'ECONNREFUSED') {
      friendlyMessage = `Could not connect to ChromaDB at ${chromaDBUrl}. Please ensure ChromaDB is running and accessible.`;
    } else if (e.message) {
      friendlyMessage += ` Details: ${e.message}`;
    }
    error = friendlyMessage;
  }

  if (error) {
    return <CollectionErrorDisplay error={error} />;
  }

  if (!collection) {
    // This case might occur if there's no error but the collection is not found.
    return <div>Collection not found.</div>;
  }

  // Render the Client Component and pass the fetched data as props
  return <CollectionDetail collection={collection} documents={documents} documentsError={documentsError} collectionCount={collectionCount} />;
}

export default CollectionPage;
import { NextResponse } from 'next/server';

interface RouteParams {
    params: {
        id: string;
        name: string;
    }
}

// This route handler will fetch documents for a specific collection.
// It proxies the request to the ChromaDB backend.
export async function GET(request: Request, { params }: RouteParams) {
    const { id } = params; // Collection ID from the URL

    if (!id) {
        return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const chromaDBUrl = process.env.CHROMADB_URL || 'http://localhost:8000';
    // Using default tenant and database names, can be overridden by environment variables
    const tenantName = process.env.CHROMADB_TENANT || 'default_tenant';
    const databaseName = process.env.CHROMADB_DATABASE || 'default_database';
    
    // This is the ChromaDB endpoint to get records from a collection
    const collectionEndpoint = `/api/v2/tenants/${tenantName}/databases/${databaseName}/collections/${id}/get`;

    try {
        const res = await fetch(`${chromaDBUrl}${collectionEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            // The body specifies what to include in the response.
            // Here we are asking for the documents as requested.
            body: JSON.stringify({
                include: ["documents"]
            })
        });

        if (!res.ok) {
            const errorMessage = `Failed to fetch documents. Status: ${res.status}`;
            const errorDetails = await res.json().catch(() => res.text());
            console.error(errorMessage, errorDetails);
            return NextResponse.json({ error: errorMessage, details: errorDetails }, { status: res.status });
        }

        const data = await res.json();
        // The response from ChromaDB will be in the format { ids: [...], documents: [...] }
        // We are forwarding the whole response.
        return NextResponse.json(data);

    } catch (error: TError) {
        console.error(`Error fetching documents for collection ${id}:`, error);
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            const friendlyMessage = `Could not connect to ChromaDB at ${chromaDBUrl}. Please ensure ChromaDB is running and accessible.`;
            return NextResponse.json({ error: friendlyMessage }, { status: 503 }); // Service Unavailable
        }
        return NextResponse.json({ error: 'An internal server error occurred while fetching documents.' }, { status: 500 });
    }
}
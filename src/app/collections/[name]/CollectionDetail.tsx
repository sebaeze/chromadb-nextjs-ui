"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Define an interface for the structure of a single collection's metadata
interface CollectionMetadata {
  [key: string]: [value: string];
}

// Define an interface for the structure of a single document
interface Document {
  id: string;
  document: string | null;
  metadata: CollectionMetadata | null;
}

// Define an interface for the props, which will be the collection data
interface CollectionDetailProps {
  collection: {
    id: string;
    name: string;
    metadata: CollectionMetadata | null;
  };
  documents: Document[] | null;
  documentsError: string | null;
  collectionCount: number | null;
}

const CollectionDetail = ({ collection, documents, documentsError, collectionCount }: CollectionDetailProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current limit from URL, default to 10
    const currentLimit = searchParams.get('limit') || '3';

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = e.target.value;
        router.push(`/collections/${collection.name}?limit=${newLimit}`);
    };

    return (
        <div className="container">
            <main className="main">
                <div className="breadcrumb">
                    <Link href="/">Collections</Link> / <span>{collection.name}</span>
                </div>

                <div className="collectionDetail">
                    <h1 className="title">Collection: {collection.name}</h1>
                    <div className="detailGrid">
                        <div className="detailItem"><strong>ID:</strong></div>
                        <div className="detailItem code">{collection.id}</div>

                        {collection.metadata && Object.keys(collection.metadata).length > 0 && (
                            <>
                                <div className="detailItem"><strong>Metadata:</strong></div>
                                <div className="detailItem">
                                    {JSON.stringify(collection.metadata, null, 2)}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="documentsSection">
                    <div className="sectionHeader">
                        <h2 className="sectionTitle">Documents</h2>
                        <div className="limitSelector">
                            <label htmlFor="limit-select">Show:</label>
                            <select id="limit-select" value={currentLimit} onChange={handleLimitChange}>
                                <option value="2">2</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                {collectionCount !== null && <option value={collectionCount}>All ({collectionCount})</option>}
                            </select>
                        </div>
                    </div>

                    {documentsError && (
                        <div className="error">
                            <p>Error fetching documents:</p>
                            <p>{documentsError}</p>
                        </div>
                    )}

                    {documents && documents.length > 0 && (
                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '20%', textAlign: 'left', padding: '8px' }}>ID</th>
                                    <th style={{ width: '40%', textAlign: 'left', padding: '8px' }}>Metadata</th>
                                    <th style={{ width: '40%', textAlign: 'left', padding: '8px' }}>Content</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="documentItem">
                                        <td className="detailItem code" style={{width:'20%', verticalAlign: 'top', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '8px'}}>
                                            {doc.id}
                                        </td>
                                        <td className="detailItem" style={{width:'40%', verticalAlign: 'top', padding: '8px'}}>
                                            {doc.metadata && Object.keys(doc.metadata).length > 0 ? (
                                                <div style={{ overflowX: 'auto', whiteSpace: 'nowrap'}}>
                                                    <pre  style={{
                                                        backgroundColor: '#fafafa',
                                                        border: '1px solid #eee',
                                                        borderRadius: '4px',
                                                        padding: '1rem',
                                                        margin: 0,
                                                        maxHeight: '8em',      // Limits height to ~8 lines (e.g., 8 lines * 1.5em line-height)
                                                        overflowY: 'auto',      // Adds vertical scrollbar when content exceeds maxHeight
                                                        whiteSpace: 'pre-wrap', // Preserves whitespace and wraps long lines
                                                        wordBreak: 'break-word' // Ensures long words don't overflow horizontally
                                                    }}>
                                                        {JSON.stringify(doc.metadata, null, 2)}
                                                    </pre>
                                                </div>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="detailItem" style={{width:'40%', verticalAlign: 'top', padding: '8px'}}>
                                            <pre style={{
                                                backgroundColor: '#fafafa',
                                                border: '1px solid #eee',
                                                borderRadius: '4px',
                                                padding: '1rem',
                                                margin: 0,
                                                maxHeight: '8em',      // Limits height to ~8 lines (e.g., 8 lines * 1.5em line-height)
                                                overflowY: 'auto',      // Adds vertical scrollbar when content exceeds maxHeight
                                                whiteSpace: 'pre-wrap', // Preserves whitespace and wraps long lines
                                                wordBreak: 'break-word' // Ensures long words don't overflow horizontally
                                            }}>
                                                {doc.document || 'N/A'}
                                            </pre>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {documents && documents.length === 0 && !documentsError && <p>No documents found in this collection.</p>}
                </div>
            </main>

            <style jsx>{`
                .container {
                  min-height: 100vh;
                  padding: 0 0.5rem;
                  display: flex;
                  flex-direction: column;
                  justify-content: flex-start; /* Align top */
                  align-items: center;
                  background-color: #f0f2f5;
                  color: #333;
                }
                .main {
                  padding: 2rem;
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  width: 100%;
                  max-width: 99%;
                }
                .breadcrumb {
                    width: 100%;
                    margin-bottom: 2rem;
                    font-size: 1rem;
                }
                .breadcrumb a {
                    color: #0070f3;
                    text-decoration: none;
                }
                .breadcrumb a:hover {
                    text-decoration: underline;
                }
                .breadcrumb span {
                    color: #555;
                }
                .title {
                  margin: 0;
                  line-height: 1.15;
                  font-size: 2.5rem;
                  text-align: left;
                  width: 100%;
                  margin-bottom: 2rem;
                  color: #0070f3;
                }
                .collectionDetail {
                    background: #fff;
                    border: 1px solid #ddd;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    width: 100%;
                }
                .detailGrid {
                    display: grid;
                    grid-template-columns: 120px 1fr;
                    gap: 1rem;
                    align-items: start;
                }
                .detailItem {
                    word-break: break-all;
                }
                .detailItem pre {
                    background-color: #f8f8f8;
                    padding: 0.5rem;
                    border-radius: 4px;
                    overflow-x: auto;
                    border: 1px solid #eee;
                    margin: 0;
                }
                .detailItem.code {
                    font-family: var(--font-geist-mono), monospace;
                    background-color: #f8f8f8;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                }
                .documentsSection {
                    margin-top: 3rem;
                    width: 100%;
                }
                .sectionHeader {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    margin-bottom: 2rem;
                }
                .sectionTitle {
                    font-size: 2rem;
                    color: #333;
                    border-bottom: 2px solid #0070f3;
                    padding-bottom: 0.5rem;
                    margin: 0; /* Reset margin as it's now in a flex container */
                }
                .limitSelector {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .limitSelector select {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                    font-size: 1rem;
                }
                .documentList {
                    list-style: none;
                    padding: 0;
                }
                .documentItem {
                    background: #fff;
                    border: 1px solid #ddd;
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .documentContent {
                    white-space: pre-wrap; /* Preserve whitespace and wrap text */
                    overflow-wrap: break-word; /* Use standard property to wrap long words */
                    background-color: #fafafa;
                    padding: 1rem;
                    border-radius: 4px;
                    border: 1px solid #eee;
                    max-height: 200px;
                    overflow-y: auto;
                    min-width: 0; /* Fix for grid layout blowout with long content */
                }
                .error {
                  color: red;
                  background-color: #ffebee;
                  border: 1px solid red;
                  padding: 1rem;
                  border-radius: 8px;
                  width: 100%;
                  box-sizing: border-box;
                }
                .error p {
                    margin: 0;
                }
                .error p:first-child {
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
}

export default CollectionDetail;
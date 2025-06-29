'use client';

interface CollectionErrorDisplayProps {
    error: string;
}

const CollectionErrorDisplay = ({ error }: CollectionErrorDisplayProps) => {
    return (
        <div className="container">
            <main className="main">
                <div className="error">
                    <p>Error fetching collection details:</p>
                    <p>{error}</p>
                </div>
            </main>
            <style jsx>{`
                /* Basic error styling */
                .container {
                  min-height: 100vh;
                  padding: 2rem;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background-color: #f0f2f5;
                }
                .main {
                    width: 100%;
                    max-width: 800px;
                }
                .error {
                  color: red;
                  background-color: #ffebee;
                  border: 1px solid red;
                  padding: 1rem;
                  border-radius: 8px;
                  width: 100%;
                }
            `}</style>
        </div>
    );
};

export default CollectionErrorDisplay;
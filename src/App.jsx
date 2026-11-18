
import React from 'react';

function App() {
    return (
        <main className="maintenance-page">
            <div className="maintenance-content">

                <div className="maintenance-icon">
                    <span>⚙️</span>
                </div>

                <h1>Dear Customer</h1>

                <p>
                    Our Website is in Active Development right now.
                </p>

                <p>
                    Please try again after some time.
                </p>

                <div className="status">
                    <span className="status-dot"></span>
                    Website Under Maintenance
                </div>

            </div>
        </main>
    );
}

export default App;

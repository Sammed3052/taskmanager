import React, { useState } from 'react';

const PMDeploy = () => {
  const [testedSubmissions] = useState([
    {
      id: 1,
      developer: 'Dev A',
      code: `function login() {
  // login logic
}`,
      testerReview: 'Tested successfully. No bugs found.'
    },
    {
      id: 2,
      developer: 'Dev B',
      code: `const fetchData = async () => {
  // API call
};`,
      testerReview: 'Passed all test cases. Ready to deploy.'
    }
  ]);

  const [deployedIds, setDeployedIds] = useState([]);

  const handleDeploy = (id) => {
    setDeployedIds([...deployedIds, id]);
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-center mb-4">🚀 Deploy Tested Code</h2>

      {testedSubmissions.length === 0 ? (
        <p className="text-muted text-center">No tested code available for deployment.</p>
      ) : (
        <div className="row">
          {testedSubmissions.map((submission) => (
            <div className="col-md-6 mb-4" key={submission.id}>
              <div className="card shadow-sm p-3">
                <h5 className="mb-2">👨‍💻 {submission.developer}</h5>
                <p className="text-muted"><strong>Tester Review:</strong> {submission.testerReview}</p>
                <pre className="bg-light p-2" style={{ whiteSpace: 'pre-wrap', borderRadius: '5px' }}>
                  {submission.code}
                </pre>
                <button
                  className="btn btn-success mt-2"
                  disabled={deployedIds.includes(submission.id)}
                  onClick={() => handleDeploy(submission.id)}
                >
                  {deployedIds.includes(submission.id) ? '✅ Deployed' : '🚀 Deploy Code'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PMDeploy;

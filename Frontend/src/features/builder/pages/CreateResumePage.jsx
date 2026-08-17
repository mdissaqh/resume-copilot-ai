import { Link } from "react-router-dom";

const CreateResumePage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '20px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#1a1a1a' }}>Create Your Resume</h1>
            <p style={{ fontSize: '1.1rem', color: '#4a4a4a', marginBottom: '32px', maxWidth: '600px' }}>
                The A4 Interactive Builder and target setup flow are currently being constructed. For now, please return to upload an existing resume.
            </p>
            <Link to="/upload" style={{ padding: '12px 24px', backgroundColor: '#0066ff', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                ← Back to Upload
            </Link>
        </div>
    );
};

export default CreateResumePage;
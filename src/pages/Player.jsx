import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import App from '../App';

export default function Player() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url');

  useEffect(() => {
    if (!url) {
      navigate('/');
      return;
    }
  }, [url, navigate]);

  if (!url) {
    return null;
  }

  // Pass the URL as a prop and enable player mode (hides sidebar on mobile)
  return <App initialUrl={decodeURIComponent(url)} playerMode={true} />;
}

import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const useGAPIInit = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGAPI = async () => {
      try {
        await new Promise((resolve, reject) => {
          gapi.load('client:auth2', async () => {
            try {
              await gapi.client.init({
                apiKey: import.meta.env.VITE_API_KEY,
                clientId: import.meta.env.VITE_CLIENTID,
                discoveryDocs: [
                  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
                  'https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2'
                ],
                scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly'
              });
              resolve('GAPI Initialized');
            } catch (err) {
              reject(err);
            }
          });
        });
      } catch (err) {
        setError('Failed to initialize GAPI');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeGAPI();
  }, []);

  return { loading, error };
};

export default useGAPIInit;

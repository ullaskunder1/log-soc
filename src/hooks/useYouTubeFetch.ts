import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

interface YouTubeAnalyticsResponse {
  kind: string;
  columnHeaders: Array<{ name: string; dataType: string; columnType: string }>;
  rows: Array<Array<any>>;
}

const CLIENT_ID = import.meta.env.VITE_CLIENTID;
const SCOPE = 'https://www.googleapis.com/auth/yt-analytics.readonly';
const DISCOVERY_DOC = 'https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2';

const useYouTubeAnalytics = (
  startDate: string,
  endDate: string,
  metrics: string,
  dimensions?: string
) => {
  const [data, setData] = useState<YouTubeAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function authenticate() {
      try {
        await gapi.auth2.getAuthInstance();
        console.log("API FETCH auth 1======")
      } catch (err) {
        throw new Error('Authentication failed');
      }
    }

    async function loadClient() {
      try {
        await gapi.client.load(DISCOVERY_DOC);
        console.log("API FETCH auth 2======")
      } catch (err) {
        throw new Error('Failed to load GAPI client');
      }
    }

    async function fetchData() {
      try {
        setLoading(true);
        console.log("API FETCH auth 3=======")
        await authenticate();
        console.log("API FETCH auth 4=======")
        await loadClient();
        console.log("API FETCH auth 5=======")
        const response = await gapi.client.youtubeAnalytics.reports.query({
          "ids": "channel==MINE",
          "startDate": "2017-01-01",
          "endDate": "2017-12-31",
          "metrics": "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained",
          "dimensions": "day",
          "sort": "day"  
          // "ids": "channel==UCviq8Ih6BhHmlLEtcXEG_XQ",
          // dimensions:"ageGroup,gender",
          // metrics:"viewerPercentage",
          // filters:"province==US-CA",
          // sort:"gender,ageGroup",
        });
        console.log("API FETCH auth 6=======", response)
        setData(response.result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    }

    gapi.load('client:auth2', () => {
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        fetchData();
      } else {
        gapi.auth2.init({ client_id: CLIENT_ID }).then(() => {
          fetchData();
        });
      }
    });
  }, [startDate, endDate, metrics, dimensions]);

  return { data, loading, error };
};

export default useYouTubeAnalytics;

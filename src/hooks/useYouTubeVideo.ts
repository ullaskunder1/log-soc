// import { useEffect, useState } from 'react';
// import { gapi } from 'gapi-script';

// interface YouTubeVideosResponse {
//   items: Array<{
//     id: string;
//     snippet: {
//       title: string;
//       description: string;
//       thumbnails: {
//         default: { url: string };
//         medium: { url: string };
//         high: { url: string };
//       };
//     };
//   }>;
// }

// const useYouTubeVideos = (channelId: string) => {
//   const [videos, setVideos] = useState<YouTubeVideosResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         setLoading(true);
//         const response = await gapi.client.youtube.search.list({
//           part: 'snippet',
//           channelId,
//           maxResults: 10,
//           order: 'date',
//         });
//         console.log("From hook videos respoonse")
//         setVideos(response.result);
//       } catch (err) {
//         setError(err instanceof Error ? err : new Error('Unknown error occurred'));
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (gapi?.client?.youtube) {
//       fetchData();
//     } else {
//       gapi.load('client', () => {
//         gapi.client.load('youtube', 'v3', fetchData);
//       });
//     }
//   }, [channelId]);

//   return { videos, loading, error };
// };

// export default useYouTubeVideos;

import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

interface YouTubeVideoDetail {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface YouTubeVideosResponse {
  items: YouTubeVideoDetail[];
}

const useYouTubeVideos = (channelId: string) => {
  const [videos, setVideos] = useState<YouTubeVideosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch video IDs
        const response = await gapi.client.youtube.search.list({
          part: 'snippet',
          channelId,
          maxResults: 10,
          order: 'date',
        });

        const videoIds = response.result.items.map((item: any) => item.id.videoId).join(',');

        // Fetch video details
        const detailsResponse = await gapi.client.youtube.videos.list({
          part: 'snippet,statistics',
          id: videoIds,
        });

        console.log('========, channelId', channelId)
        console.log(response, detailsResponse)
        console.log('======== videoIds', videoIds)

        setVideos(detailsResponse.result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    }

    if (gapi?.client?.youtube) {
      fetchData();
    } else {
      gapi.load('client', () => {
        gapi.client.load('youtube', 'v3', fetchData);
      });
    }
  }, [channelId]);

  return { videos, loading, error };
};

export default useYouTubeVideos;

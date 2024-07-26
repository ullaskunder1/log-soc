import React, { useEffect, useState } from "react";
import Header from "./component/Header";
import { useAuth } from "./context/AppContext";
import useYouTubeAnalytics from "./hooks/useYouTubeFetch";
import styles from "./App.module.scss";
import { gapi } from "gapi-script";
import GoogleLogin from "react-google-login";
import useYouTubeVideos from "./hooks/useYouTubeVideo";
import InstagramLoginComponent from "./component/InstaLoginBtn";

const App: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, dispatch } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  const handleSuccess = (response: any) => {
    console.log("Login Success:", response);
    dispatch({ type: "SET_GOOGLE_INFO", payload: response });
    gapi.client.setToken({ access_token: response.accessToken });
    gapi.client
      .request({
        path: "https://www.googleapis.com/youtube/v3/channels",
        params: { part: "snippet,contentDetails,statistics", mine: true },
      })
      .then((response: any) => {
        console.log("YouTube Data:", response);
        dispatch({ type: "SET_YOUTUBE_INFO", payload: response });
      });
  };

  const handleFailure = (error: any) => {
    console.log("Login Failed:", error);
    if (error.error === "popup_closed_by_user") {
      setErrorMessage("Login was cancelled. Please try again.");
    } else {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if(selectedPlatform !== 'youtube') return;
    function start() {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance) {
        gapi.auth2.init({
          clientId: import.meta.env.VITE_CLIENTID,
          scope: "https://www.googleapis.com/auth/youtube.readonly",
        });
      }
    }

    gapi.load("client:auth2", start);
  }, []);

  const {
    data: youtubeData,
    loading: youtubeLoading,
    error: youtubeError
  } = useYouTubeAnalytics(
    "2023-12-21",
    "2023-12-31",
    "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,viewerPercentage",
    "gender",
    selectedPlatform !== "youtube"
  );

  const {
    videos,
    loading: videosLoading,
    error: videosError
  } = useYouTubeVideos(
    state.youtubeInfo?.result?.items[0]?.id,
    selectedPlatform !== "youtube"
  );

  // const { videos, loading: videosLoading, error: videosError } = useYouTubeVideos('UCviq8Ih6BhHmlLEtcXEG_XQ');

  console.log("Fetched YouTube Analytics Data:", youtubeData);
  console.log("Fetched YouTube Videos Data:", videos);

  const { body, ...youtubeInfoWithoutBody } = state.youtubeInfo || {};

  return (
    <div>
      <Header />
      <button
          onClick={() => setSelectedPlatform("youtube")}
          className={`${styles["auth-screen__platform-button"]} ${selectedPlatform === "youtube" ? styles["selected"] : ""}`}
        >
          YouTube
        </button>
        <button
          onClick={() => setSelectedPlatform("instagram")}
          className={`${styles["auth-screen__platform-button"]} ${selectedPlatform === "instagram" ? styles["selected"] : ""}`}
        >
          Instagram
        </button>
      <div className={styles["auth-screen__social-auth"]}>
        <div className={styles["auth-screen__social-buttons"]}>
          <GoogleLogin
            clientId={import.meta.env.VITE_CLIENTID}
            prompt="consent"
            buttonText="Youtube"
            onSuccess={handleSuccess}
            onFailure={handleFailure}
            scope="https://www.googleapis.com/auth/youtube.readonly"
            className={`${styles["auth-screen__social-button"]} ${styles["auth-screen__social-button--youtube"]}`}
          />
          <button
            className={`${styles["auth-screen__social-button"]} ${styles["auth-screen__social-button--instagram"]}`}
          >
            Instagram
          </button>
          <InstagramLoginComponent />
          <button
            className={`${styles["auth-screen__social-button"]} ${styles["auth-screen__social-button--tiktok"]}`}
          >
            TikTok
          </button>
        </div>
        {errorMessage && (
          <p className={styles["auth-screen__error-message"]}>{errorMessage}</p>
        )}
      </div>
      <section>
        <h2>YouTube Info from State</h2>
        {youtubeInfoWithoutBody ? (
          <pre>{JSON.stringify(youtubeInfoWithoutBody, null, 2)}</pre>
        ) : (
          <p>No YouTube info available</p>
        )}
      </section>
      <section style={{ display: "flex" }}>
        <section>
          <div style={{height: '500px', background: 'white', color: 'black', overflow: 'scroll'}}>
            <h2>YouTube Analytics Data</h2>
            {youtubeLoading && <p>Loading...</p>}
            {youtubeError && !youtubeData && <p>Error: {youtubeError.message}</p>}
            {youtubeData && <pre>{JSON.stringify(youtubeData, null, 2)}</pre>}
          </div>
        </section>
        <section>
          <h2>Youtube video</h2>
          {videosLoading && <p>Loading videos...</p>}
          {videosError && !videos && <p>Error: {videosError.message}</p>}
          <div className={styles['cardWrapper']}>
          {videos && videos.items.map((video) => <VideoStats key={video.id} video={video} />)}
          </div>
        </section>
      </section>
    </div>
  );
};

export default App;


const VideoStats = ({ video }:any) => {
  const { snippet, statistics } = video;
  const thumbnailUrl = snippet.thumbnails.high.url;

  return (
    <div style={{ border: '1px solid #ddd', padding: '16px', margin: '16px', borderRadius: '8px', maxWidth: '400px' }}>
      <img src={thumbnailUrl} alt={snippet.title} style={{ width: '100%', borderRadius: '8px' }} />
      <h2 style={{ fontSize: '18px', margin: '8px 0' }}>{snippet.title}</h2>
      <p>{(snippet.description).slice(0, 100)}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <div>
          <strong>Views:</strong> {statistics.viewCount}
        </div>
        <div>
          <strong>Likes:</strong> {statistics.likeCount}
        </div>
        <div>
          <strong>Comments:</strong> {statistics.commentCount}
        </div>
      </div>
    </div>
  );
};
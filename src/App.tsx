import React, { useEffect, useState } from "react";
import Header from "./component/Header";
import { useAuth } from "./context/AppContext";
import useYouTubeAnalytics from "./hooks/useYouTubeFetch";
import styles from "./App.module.scss";
import { gapi } from "gapi-script";
import GoogleLogin from "react-google-login";
import useYouTubeVideos from "./hooks/useYouTubeVideo";

const App: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { state, dispatch } = useAuth();

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

  useEffect(() => {
    if (state.isLoggedIn) {
    }
  }, [state.isLoggedIn]);

  const { data, loading, error } = useYouTubeAnalytics(
    "2023-12-21",
    "2023-12-31",
    "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,viewerPercentage",
    "gender"
  );

console.log("=================>, channelId", state.youtubeInfo?.result?.items[0]?.id)
  const { videos, loading: videosLoading, error: videosError } = useYouTubeVideos(state.youtubeInfo?.result?.items[0]?.id);
  // const { videos, loading: videosLoading, error: videosError } = useYouTubeVideos('UCviq8Ih6BhHmlLEtcXEG_XQ');

  console.log("Fetched YouTube Analytics Data:", data);
  console.log("Fetched YouTube Videos Data:", videos);

  const { body, ...youtubeInfoWithoutBody } = state.youtubeInfo || {};

  return (
    <div>
      <Header />
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
          <button
            className={`${styles["auth-screen__social-button"]} ${styles["auth-screen__social-button--facebook"]}`}
          >
            Facebook
          </button>
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
          <div>
            <h2>YouTube Analytics Data</h2>
            {loading && <p>Loading...</p>}
            {error && !data && <p>Error: {error.message}</p>}
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
          </div>
        </section>
        <section>
          <h2>Youtube video</h2>
        </section>
      </section>
    </div>
  );
};

export default App;

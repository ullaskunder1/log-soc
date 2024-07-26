import React, { useEffect } from "react";

// Extend the Window interface to include fbAsyncInit
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

const InstagramLoginComponent: React.FC = () => {
  useEffect(() => {
    // Load the Facebook SDK
    (function (d, s, id) {
      const element = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      if (element && element.parentNode) {
        element.parentNode.insertBefore(js, element);
      } else if (d.body) {
        d.body.appendChild(js);
      }
    })(document, "script", "facebook-jssdk");

    // Initialize the SDK after it's loaded
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "839154724821902", // Replace with your app ID
        cookie: true,
        xfbml: true,
        version: "1.0.1",
      });

      window.FB.AppEvents.logPageView();
    };
  }, []);

  const handleLogin = () => {
    window.FB.login(
      (response: { authResponse: any; }) => {
        if (response.authResponse) {
          console.log("Welcome! Fetching your information.... ");
          window.FB.api("/me", function (response: { name: string; }) {
            console.log("Good to see you, " + response.name + ".");
            // Handle the response
          });
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Instagram</button>
    </div>
  );
};

export default InstagramLoginComponent;

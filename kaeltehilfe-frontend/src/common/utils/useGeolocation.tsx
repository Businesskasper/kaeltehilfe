import React from "react";

type UseGeolocationResult =
  | { state: "PENDING" }
  | { state: "READY" }
  | { state: "NOT_SUPPORTED" }
  | { state: "PERMISSION_DENIED" }
  | { state: "CAPTURING"; position: { lat: number; lng: number } };

export const useGeolocation = () => {
  const [result, setResult] = React.useState<UseGeolocationResult>({
    state: "PENDING",
  });

  const watchId = React.useRef<number>();

  // console.log("position", result);

  React.useEffect(() => {
    if (!("geolocation" in navigator) || !navigator.geolocation) {
      setResult({
        state: "NOT_SUPPORTED",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Capturing supported and granted", position);
        setResult({
          state: "READY",
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            setResult({
              state: "PERMISSION_DENIED",
            });
            break;
          case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            setResult({
              state: "PERMISSION_DENIED",
            });
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            setResult({
              state: "NOT_SUPPORTED",
            });
            break;
          default:
            console.error("An unknown error occurred.");
            setResult({
              state: "NOT_SUPPORTED",
            });
            break;
        }
      },
    );
  }, []);

  React.useEffect(() => {
    if (result.state !== "READY") return;

    const unwatch = () => {
      if (typeof watchId.current === "number")
        navigator.geolocation.clearWatch(watchId.current);
    };

    unwatch();
    const newWatchId = navigator.geolocation.watchPosition(
      onWatchSuccess,
      onWatchError,
      {
        enableHighAccuracy: true,
        // timeout: 200
        maximumAge: 10000,
      },
    );
    watchId.current = newWatchId;

    return () => unwatch();
  }, [result.state]);

  const onWatchSuccess: PositionCallback = (receivedPosition) => {
    setResult({
      state: "CAPTURING",
      position: {
        lng: receivedPosition.coords.longitude,
        lat: receivedPosition.coords.latitude,
      },
    });
  };

  const onWatchError: PositionErrorCallback = (positionError) => {
    console.log("Could not get position", positionError);
  };

  return result;
};

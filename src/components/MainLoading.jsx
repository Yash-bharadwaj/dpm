import { useEffect, useState } from "react";
import { ProgressBar, Row } from "react-bootstrap";

function MainLoading() {
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div style={{ marginLeft: "40%", marginTop: "15%" }}>
      <Row container spacing={1}>
        <Row item xs={6}>
          <div p={1}>
            <img
              src={import.meta.env.VITE_REACT_APP_BLUSAPPHIRE_LOGO}
              height="50em"
            />
          </div>
        </Row>

        <Row item style={{ marginTop: "8px", width: "50%" }}>
          <ProgressBar animated now={progress} style={{ padding: 0 }} />
        </Row>
      </Row>
    </div>
  );
}

export default MainLoading;

import React from "react";
import PropTypes from "prop-types";

const P404 = () => {
  return (
    <div>
      <div style={{ backgroundColor: "#90A4AE", width: "100%" }}>
        <div
          style={{
            color: "#E0E0E0",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "200px",
            marginTop: "5%"
          }}
        >
          404
        </div>
      </div>
      <div
        style={{
          color: "#E0E0E0",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "50px",
          marginTop: "5%"
        }}
      >
        Page Not Found
      </div>
    </div>
  );
};
export default P404;

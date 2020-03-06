import * as React from "react";
import { Link } from "react-router-dom";

export const AnalysisPage = () => (
    <div className="jumbotron">
        <h1>Analysis</h1>
        <p>React, Redux and React Router for ultra-responsive web apps.</p>
        <Link to="about" className="btn btn-primary btn-lg">
            Learn more
        </Link>
    </div>
);

import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import MobileContainer from "@/components/layout/MobileContainer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MobileContainer className="flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="text-6xl font-bold text-honey-500 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button className="bg-accent hover:bg-accent/90">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </MobileContainer>
  );
};

export default NotFound;

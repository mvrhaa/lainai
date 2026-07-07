"use client";

import { ErrorState } from "@/components/error-state";

const ErrorPage = () => {
    return (
        <ErrorState
            title="Couldn't load this agent"
            description="It may have been deleted, or you may not have access to it."
        />
    );
};

export default ErrorPage;

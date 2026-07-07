"use client";

import { ErrorState } from "@/components/error-state";

const ErrorPage = () => {
    return (
        <ErrorState
            title="Couldn't load this chat"
            description="The conversation may have been deleted, or you may not have access to it."
        />
    );
};

export default ErrorPage;

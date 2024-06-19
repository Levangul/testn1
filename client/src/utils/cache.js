import { InMemoryCache } from "@apollo/client";

const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                posts: {
                    keyArgs: false,
                    merge(existing = [], incoming) {
                        const merged = existing ? existing.slice(0) : [];
                        incoming.forEach(post => {
                            if (!merged.find(existingPost => existingPost.id === post.id)) {
                                merged.push(post);
                            }
                        });
                        return merged;
                    }
                }
            }
        }
    }
});

export default cache;
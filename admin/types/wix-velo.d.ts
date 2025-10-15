declare module 'wix-blog-backend' {
  export namespace draftPosts {
    function createDraftPost(draftPost: any, options?: any): Promise<any>;
    function publishDraftPost(draftPostId: string, options?: any): Promise<any>;
    function getDraftPost(draftPostId: string, options?: any): Promise<any>;
    // other functions can be added as needed
  }
  // Export a catch-all to avoid TypeScript complaints for any other usage
  const blogBackend: any;
  export = blogBackend;
}

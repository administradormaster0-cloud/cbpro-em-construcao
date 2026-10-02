
const {organizationStorageUrl,ORGANIZATION_STORAGE_BUCKETS} = globalThis;
function organizationSlideImageUrl(i){return organizationStorageUrl(ORGANIZATION_STORAGE_BUCKETS.slides,i)}
export {organizationSlideImageUrl};

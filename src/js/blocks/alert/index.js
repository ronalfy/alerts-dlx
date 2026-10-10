import { InnerBlocks } from "@wordpress/block-editor";
import { registerBlockType } from "@wordpress/blocks";

import metadata from "./block.json";
import Edit from "./edit";
import variations from "./variations";
import { createCanonicalAlertTransforms } from "../utils/canonical-alert-transforms";

const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24px"
    height="24px"
    viewBox="0 0 80 80"
  >
    <path
      fill="#f7a8a8"
      d="M6 71.5c-1.93 0-3.5-1.57-3.5-3.5 0-.652.203-1.303.62-1.991l33.71-55.5C37.605 9.232 38.761 8.5 40 8.5s2.395.732 3.17 2.01l33.71 55.5c.417.687.62 1.338.62 1.99 0 1.93-1.57 3.5-3.5 3.5z"
    />
    <path
      fill="#c74343"
      d="M40 9c1.452 0 2.342 1.108 2.743 1.769l16.855 27.75 16.855 27.75c.368.606.547 1.172.547 1.731 0 1.654-1.346 3-3 3H6c-1.654 0-3-1.346-3-3 0-.559.179-1.125.547-1.731l16.855-27.75 16.855-27.75C37.658 10.108 38.548 9 40 9m0-1c-1.581 0-2.829.983-3.598 2.25l-33.71 55.5C2.29 66.413 2 67.166 2 68a4 4 0 0 0 4 4h68a4 4 0 0 0 4-4c0-.834-.29-1.587-.692-2.25l-33.71-55.5C42.829 8.983 41.581 8 40 8"
    />
    <path
      fill="#36404d"
      d="M40 56a4 4 0 1 0 0 8 4 4 0 1 0 0-8m0-28c-2.209 0-4 1.653-4 3.692 0 1.363 2.005 18.61 2.014 18.683C38.133 51.29 38.976 52 40 52s1.867-.71 1.986-1.625C41.995 50.302 44 33.056 44 31.692 44 29.653 42.209 28 40 28"
    />
    <path
      fill="#c74343"
      d="m65.902 35.414 10.91-1.301-.57-.939-10.91 1.301.249.41zm3.676-13.211-.52-.855-8.756 4.845.519.856zm-13.755-3.384 6.62-8.363-.553-.911-6.621 8.363zm-31.092-.911L18.11 9.545l-.553.911 6.62 8.363zM14.419 34.885l.249-.41-10.91-1.301-.57.939 10.91 1.301zm4.76-7.836.519-.856-8.756-4.845-.52.855z"
    />
  </svg>
);

registerBlockType(metadata.name, {
  edit: Edit,
  variations,
  transforms: createCanonicalAlertTransforms(),
  save() {
    return <InnerBlocks.Content />;
  },
  icon: <AlertIcon />,
});

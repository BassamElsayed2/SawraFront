import { useQuery } from "@tanstack/react-query";
import AddBanner from "../ad-banner/AddBanner";
import SidebarOne from "../sidebar/SidebarOne";
import PostLayoutTwo from "./layout/PostLayoutTwo";
import { getAds } from "../../../../services/apiAds";

const PostSectionFour = ({ postData, adBanner }) => {
  const { data: ads } = useQuery({
    queryKey: ["ads"],
    queryFn: getAds,
  });

  const homeAds = ads?.filter((ad) => ad.location === "home") || [];
  const secondHomeAd = homeAds[1];


  return (
    <div className="axil-post-list-area post-listview-visible-color axil-section-gap bg-color-white">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-xl-8">
            {secondHomeAd && (
              <AddBanner
                img={secondHomeAd.image_url}
                height="210"
                width="810"
                data={secondHomeAd}
              />
            )}
            <PostLayoutTwo dataPost={postData} show="5" />
          </div>
          <div className="col-lg-4 col-xl-4 mt_md--40 mt_sm--40">
            <SidebarOne dataPost={postData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSectionFour;
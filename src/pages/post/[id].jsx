import { useRouter } from "next/router";
import PostMetaTwo from "../../common/components/post/format/element/PostMetaTwo";
import { getAllPosts } from "../../../lib/api";
import { getNewsById, getNews } from "../../../services/apiNews";
import { useQuery } from "@tanstack/react-query";
import HeaderOne from "../../common/elements/header/HeaderOne";
import FooterThree from "../../common/elements/footer/FooterThree";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SortingByDate } from "../../common/utils";
import PostMetaOne from "../../common/components/post/format/element/PostMetaOne";
import Image from "next/image";
import SidebarOne from "../../common/components/sidebar/SidebarOne";
import WidgetVideoPost from "../../common/components/sidebar/WidgetVideoPost";
import { getAds } from "../../../services/apiAds";
import AddBanner from "../../common/components/ad-banner/AddBanner";

const NewsDetailsPage = ({ allPosts, initialData }) => {
  const { query, locale } = useRouter();
  const { id } = query;

  const { data: details = initialData, isLoading: isLoadingPost } = useQuery({
    queryKey: ["news", id],
    queryFn: () => getNewsById(id),
    enabled: !!id,
    initialData,
  });

  const { data: postData } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  const { data: ads } = useQuery({
    queryKey: ["ads"],
    queryFn: getAds,
  });

  const otherads = ads?.filter((ad) => ad.location === "other");

  if (isLoadingPost) {
    return <div>Loading...</div>;
  }

  // Get additional images excluding the first one (feature image)
  const additionalImages = details?.images?.slice(1) || [];

  return (
    <>
      <HeaderOne
        pClass="header-light header-sticky header-with-shadow"
        postData={allPosts}
      />

      <PostMetaOne metaData={details} />
      <div className="post-single-wrapper axil-section-gap bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="axil-post-details">
                {details?.yt_code ? (
                  <div className="embed-responsive embed-responsive-16by9 mb-4">
                    <iframe
                      src={`https://www.youtube.com/embed/${details.yt_code}`}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full aspect-video"
                      title="YouTube video player"
                    />
                  </div>
                ) : null}

                <div
                  className="post-details-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      locale === "en" ? details.content_en : details.content_ar,
                  }}
                ></div>

                {/* Additional Images Gallery */}
                {additionalImages.length > 0 && (
                  <div className="additional-images-gallery mt-5">
                    <h3 className="mb-4">
                      {locale === "en" ? "More Images" : "المزيد من الصور"}
                    </h3>
                    <div className="row g-4">
                      {additionalImages.map((image, index) => (
                        <div key={index} className="col-md-4">
                          <div className="gallery-item">
                            <Image
                              src={image}
                              alt={`${details.title_en} - Image ${index + 2}`}
                              width={400}
                              height={300}
                              className="img-fluid rounded"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-4">
              <SidebarOne dataPost={postData} />
              <WidgetVideoPost postData={postData} />
            </div>
          </div>
          {otherads && (
            <div className="row">
              <div className="col-lg-12">
                <AddBanner
                  img={otherads[0].image_url}
                  height="200"
                  width="1230"
                  pClass="mt--30"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <FooterThree />
    </>
  );
};

export default NewsDetailsPage;

export async function getStaticPaths() {
  // Get all news IDs
  const news = await getNews();

  // Create paths for each news item
  const paths = news.map((item) => ({
    params: { id: item.id.toString() },
    locale: "en", // English version
  }));

  // Add Arabic versions
  const arabicPaths = news.map((item) => ({
    params: { id: item.id.toString() },
    locale: "ar", // Arabic version
  }));

  return {
    paths: [...paths, ...arabicPaths],
    fallback: "blocking", // Show a loading state while generating new pages
  };
}

export async function getStaticProps({ params, locale }) {
  try {
    const allPosts = getAllPosts([
      "postFormat",
      "title",
      "featureImg",
      "featured",
      "date",
      "slug",
      "pCate",
      "cate",
      "cate_img",
      "author_img",
      "author_name",
      "post_views",
      "read_time",
      "author_social",
    ]);

    SortingByDate(allPosts);

    // Get the initial data for the news item
    const initialData = await getNewsById(params.id);

    return {
      props: {
        allPosts,
        initialData,
        ...(await serverSideTranslations(locale, ["common"])),
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    return {
      notFound: true, // This will show the 404 page
    };
  }
}

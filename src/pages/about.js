import BreadcrumbTwo from "../common/elements/breadcrumb/breadcrumbTwo";
import FooterThree from "../common/elements/footer/FooterThree";
import HeaderOne from "../common/elements/header/HeaderOne";
import { getAllPosts } from "../../lib/api";
import WidgetCategory from "../common/components/sidebar/WidgetCategory";
import WidgetSearch from "../common/components/sidebar/WidgetSearch";
import WidgetPostList from "../common/components/sidebar/WidgetPostList";
import WidgetSocialShare from "../common/components/sidebar/WidgetSocialShare";
import HeadTitle from "../common/elements/head/HeadTitle";
import GalleryOne from "../common/gallery/GalleryOne";
import { getAboutUs } from "../../services/apiAboutUs";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

const AboutUs = ({ allPosts }) => {
  const locale = useLocale();

  const { data: aboutUs } = useQuery({
    queryKey: ["site_settings"],
    queryFn: getAboutUs,
  });

  return (
    <>
      <HeadTitle pageTitle={locale === "ar" ? "من نحن" : "About Us"} />
      <HeaderOne postData={allPosts} />
      <div className="breadcrumb-box">
      <BreadcrumbTwo
        title={locale === "ar" ? "من نحن" : "About Us"}
        paragraph={
          locale === "ar"
            ? "أينما ومتى أحتاج إليكم. نحن هنا لك – تواصل معنا لجميع احتياجاتكم. <br /> بأي مساعدة تحتاجون."
            : "Wherever &amp; whenever you need us. We are here for you – contact us for all your support needs. <br /> be it technical, general queries or information support."
        }
        bgImae="url('/images/about.png')"
      />
      </div>
      <div className="axil-post-list-area about-background axil-section-gap">

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-8">
              {/* Start About Area  */}
              <div className="axil-about-us center-box">
  <h2 className="about-title">
    {locale === "ar" ? "معلومات عنا" : "Who We Are"}
  </h2>
  <div className="inner">
    <div
      dangerouslySetInnerHTML={{
        __html:
          locale === "ar"
            ? aboutUs?.about_us_ar
            : aboutUs?.about_us_en,
      }}
    />
  </div>
</div>

              {/* End About Area  */}
            </div>
           {/*   <div className="col-lg-4 col-xl-4 mt_md--40 mt_sm--40 about-sidebar">
             <div className="sidebar-inner">
               <WidgetPostList postData={allPosts} />
             </div> 
            </div>*/}
          </div>
        </div>
      </div>

      <GalleryOne parentClass="bg-color-grey" />
      <FooterThree />
    </>
  );
};

export default AboutUs;

export async function getStaticProps() {
  const allPosts = getAllPosts([
    "id",
    "title",
    "featureImg",
    "featured",
    "date",
    "slug",
    "cate",
    "cate_img",
    "author_img",
    "author_name",
    "post_views",
  ]);

  return {
    props: { allPosts },
  };
}

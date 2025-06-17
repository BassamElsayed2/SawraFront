import FooterThree from "../common/elements/footer/FooterThree";
import { getAllPosts } from "../../lib/api";
import HeaderThree from "../common/elements/header/HeaderThree";
import HeadTitle from "../common/elements/head/HeadTitle";
import { slugify, SortingByDate } from "../common/utils";
import PostSectionNine from "../common/components/post/PostSectionNine";
import CategoryListSlide from "../common/components/category/CategoryListSlide";
import PostSectionThree from "../common/components/post/PostSectionThree";
import PostSectionFour from "../common/components/post/PostSectionFour";
import PostSectionTen from "../common/components/post/PostSectionTen";
import PostSectionEleven from "../common/components/post/PostSectionEleven";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useQuery } from "@tanstack/react-query";
import { getNews } from "../../services/apiNews";
import GalleryOne from "../common/gallery/GalleryOne";

const TechBlog = ({ allPosts }) => {
  const { data: news } = useQuery({
    queryKey: ["news"],
    queryFn: getNews,
  });

  const techPost = allPosts.filter(
    (post) =>
      slugify(post.cate) === "technology" || slugify(post.cate) === "leadership"
  );

  return (
    <>
      <HeadTitle pageTitle="Tech Blog" />
      <HeaderThree postData={allPosts} />
      <PostSectionNine news={news} />
      <CategoryListSlide cateData={allPosts} />
      <PostSectionTen postData={allPosts} />
      <PostSectionThree postData={news} />
      <PostSectionFour postData={techPost} adBanner={true} />

      <PostSectionEleven />

      <GalleryOne parentClass="bg-color-grey" />
      <FooterThree />
    </>
  );
};

export default TechBlog;

export async function getStaticProps({ locale }) {
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
  return {
    props: { allPosts, ...(await serverSideTranslations(locale, ["common"])) },
  };
}

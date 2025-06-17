
import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import GalleryOne from "../common/gallery/InstagramOne";

import FooterThree from "../common/elements/footer/FooterThree";
import HeaderOne from "../common/elements/header/HeaderOne";
import { getAllPosts } from "../../lib/api";
import SidebarOne from "../common/components/sidebar/SidebarOne";
import PostLayoutTwo from "../common/components/post/layout/PostLayoutTwo";
import { SortingByDate } from "../common/utils";
import HeadTitle from "../common/elements/head/HeadTitle";
import GalleryOne from "../common/components/gallery/InstagramOne";

const PostListPage = ({ allPosts }) => {
  const [blogs] = useState(allPosts);
  const [pageNumber, setPageNumber] = useState(0);

  const blogsPerPage = 5;
  const pageVisited = pageNumber * blogsPerPage;

  const pageCount = Math.ceil(blogs.length / blogsPerPage);

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <>
      <HeadTitle pageTitle="Post Archive" />
      <HeaderOne
        postData={allPosts}
        pClass="header-light header-sticky header-with-shadow"
      />
      <div className="axil-post-list-area axil-section-gap bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-xl-8">
              <PostLayoutTwo
                dataPost={allPosts}
                show={pageVisited + blogsPerPage}
                postStart={pageVisited}
              />

              <ReactPaginate
                previousLabel={<i className="fas fa-arrow-left"></i>}
                nextLabel={<i className="fas fa-arrow-right"></i>}
                pageCount={pageCount}
                onPageChange={changePage}
                containerClassName={"pagination"}
                previousLinkClassName={"prev"}
                nextLinkClassName={"next"}
                disabledClassName={"disabled"}
                activeClassName={"current"}
              />
            </div>

            <GalleryOne parentClass="bg-color-grey" />
            <FooterThree />
        </>
    );
}


export default PostListPage;

export async function getStaticProps() {
  const allPosts = getAllPosts([
    "id",
    "title",
    "featureImg",
    "featured",
    "sticky",
    "postFormat",
    "playBtn",
    "date",
    "slug",
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
    props: { allPosts },
  };
}

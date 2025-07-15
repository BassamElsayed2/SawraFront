import Link from "next/link";

const SectionTitleOne = ({ title }) => {
  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="section-title">
          <h2 className="title" style={{ color: "#fff" }}>
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
};

const SectionTitleTwo = ({ title, btnText, btnUrl, className = "" }) => {
  return (
    <div className={`section-title d-flex justify-content-between align-items-center mb--30 ${className}`} style={{gap: 16}}>
      <h2 className="title" style={{ color: "#fff", margin: 0 }}>
        {title}
      </h2>
      <div className="see-all-topics">
        <Link href={btnUrl || "#"}>
          <a className="axil-link-button">
            {btnText}
          </a>
        </Link>
      </div>
    </div>
  );
};

export { SectionTitleOne, SectionTitleTwo };

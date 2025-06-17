import Image from "next/image";
import Link from "next/link";

const AddBanner = ({ img, height, width, pClass, data }) => {
  return (
    <div className={`axil-banner ${pClass ? pClass : ""}`}>
      <div className="thumbnail">
        <Link href={data?.link || "#"}>
          <a>
            {img ? (
              <Image
                src={img}
                alt={data?.title_en || "Ad banner"}
                height={height ? height : 300}
                width={width ? width : 1530}
                placeholder="blur"
                blurDataURL={`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mPcXw8AAgMBQLfkYc4AAAAASUVORK5CYII=`}
                style={{ objectFit: "cover", width: "100%", height: "auto" }}
              />
            ) : (
              <div
                style={{
                  height: height ? height : 300,
                  width: width ? width : 1530,
                  backgroundColor: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                }}
              >
                No image available
              </div>
            )}
          </a>
        </Link>
      </div>
    </div>
  );
};

export default AddBanner;

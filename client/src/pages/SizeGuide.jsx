import Header from "../components/Header";
import Footer from "../components/Footer";
import "./SizeGuide.css";
import { Link } from "react-router-dom";

export default function SizeGuide() {
  return (
    <>
      <Header />

      <div className="size-page">

        <div className="container">

          <div className="breadcrumb">
  <span>Trang chủ</span>
  <span className="separator">›</span>
  <span className="current">Hướng dẫn chọn size</span>
</div>

          {/* ================= ÁO ================= */}

          <div className="size-section">

            <h2>SIZE ÁO PHÔNG COTTON CƠ BẢN</h2>

            <div className="shirt-layout">

              <div className="shirt-image">
                <div className="size-image-box">

      <img
        src="../src/public/images/aophongcotton.png"
        alt="Áo"
        className="size-product"
      />

      <div className="line-height"></div>
      <div className="line-width"></div>

      <span className="label-a">A</span>
      <span className="label-b">B</span>

    </div>
              </div>

              <div className="shirt-table">

                <table>

                  <thead>

                    <tr>
                      <th>SIZE</th>
                      <th>Dài áo (A)</th>
                      <th>Ngang áo (B)</th>
                      <th>Cân nặng</th>
                      <th>Chiều cao</th>
                    </tr>

                  </thead>

                  <tbody>

                    <tr>
                      <td>S</td>
                      <td>64</td>
                      <td>56</td>
                      <td>≤55kg</td>
                      <td>≤165cm</td>
                    </tr>

                    <tr>
                      <td>M</td>
                      <td>66</td>
                      <td>58</td>
                      <td>≤60kg</td>
                      <td>≤175cm</td>
                    </tr>

                    <tr>
  <td>L</td>
  <td>68</td>
  <td>60</td>
  <td>≥60kg</td>
  <td>≥175cm</td>
</tr>

                  </tbody>

                </table>

              </div>

            </div>

          </div>

          {/* ================= QUẦN ================= */}

          <div className="size-section">

            <h2>SIZE  QUẦN SHORT THỂ THAO</h2>

            <div className="pants-layout">

              <div className="pants-image">

                <div className="size-image-box">

      <img
        src="../src/public/images/quanshortthethao.png"
        alt="Quần"
        className="size-product"
      />

      <div className="pants-height"></div>
      <div className="pants-waist"></div>

      <span className="label-c">A</span>
      <span className="label-d">B</span>

    </div>

              </div>

              <div className="pants-table">

                <table>

                  <thead>

                    <tr>
                      <th>Chiều cao</th>
                      <th>Cân nặng</th>
                      <th>Size</th>
                    </tr>

                  </thead>

                  <tbody>

                    <tr>
                      <td>1m60 - 1m75</td>
                      <td>50 - 55kg</td>
                      <td>S</td>
                    </tr>

                    <tr>
                      <td>1m60 - 1m75</td>
                      <td>56 - 64kg</td>
                      <td>M</td>
                    </tr>

                    <tr>
                      <td>1m60 - 1m75</td>
                      <td>65 - 74kg</td>
                      <td>L</td>
                    </tr>

                    <tr>
                      <td>1m60 - 1m80</td>
                      <td>75 - 83kg</td>
                      <td>XL</td>
                    </tr>

                    <tr>
                      <td>1m60 - 1m80</td>
                      <td>84 - 90kg</td>
                      <td>2XL</td>
                    </tr>

                  </tbody>

                </table>

              </div>

            </div>
                        <div className="pants-info">

              <h2>THÔNG SỐ QUẦN SHORT THỂ THAO</h2>

              <table>

                <thead>

                  <tr>
                    <th>Mô tả</th>
                    <th>S</th>
                    <th>M</th>
                    <th>L</th>
                    <th>XL</th>
                    <th>2XL</th>
                  </tr>

                </thead>

                <tbody>

                  <tr>
                    <td>Cạp lưng (cm)</td>
                    <td>78-81</td>
                    <td>82-85</td>
                    <td>86-90</td>
                    <td>91-94</td>
                    <td>95-100</td>
                  </tr>

                  <tr>
                    <td>Ống (cm)</td>
                    <td>26</td>
                    <td>27</td>
                    <td>28</td>
                    <td>29</td>
                    <td>31</td>
                  </tr>

                  <tr>
                    <td>Đùi (cm)</td>
                    <td>29</td>
                    <td>30.5</td>
                    <td>32</td>
                    <td>33.5</td>
                    <td>35.5</td>
                  </tr>

                  <tr>
                    <td>Mông (cm)</td>
                    <td>48</td>
                    <td>49.5</td>
                    <td>51.5</td>
                    <td>53</td>
                    <td>56.5</td>
                  </tr>

                  <tr>
                    <td>Dài (cm)</td>
                    <td>44</td>
                    <td>44.5</td>
                    <td>46</td>
                    <td>47.5</td>
                    <td>48.5</td>
                  </tr>

                </tbody>

              </table>

              <p className="note">
                *** Độ lệch thông số: (+/- 1cm)
              </p>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}

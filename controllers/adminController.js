const User = require("../models/userModel");
const product = require("../models/productModel");
const category = require("../models/categoryModel");
const coupon = require("../models/couponsModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const validator = require("validator");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

const securepassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    // Set the response headers to disable caching
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Expires", "0");
    res.setHeader("Pragma", "no-cache");
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    //console.log(email)

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", { message: "email and password is incorrect " });
        } else {
          req.session.admin = userData._id;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "email and password is incorrect " });
      }
    } else {
      return res.render("login", {
        message: "email and password is incorrect ",
      });
    }
  } catch {
    console.log(error.message);
  }
};
// const loadDashboard=async(req,res)=>{
//     try{
//         const userData=await User.findById({_id:req.session.user_id});
//        res.render('home',{admin:userData});
//     }
//     catch(error){
//         console.log(error.message)
//     }
// }
const adminLogout = async (req, res) => {
  try {
    // req.session.destroy();
    delete req.session.admin;
    return res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};
const adminDashboard = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });
    const orderData = await Order.find({});
    const productData = await product.find({});
    const order = await Order.find({}).populate('user').sort({ createdAt: -1 });
    const totalSales = await Order.aggregate([
      {
        $match: { "items.status": "delivered" },
      },
      {
        $group: {
          _id: null,
          total_amount: { $sum: "$total_amount" },
        },
      },
    ]);
    let total_amount = 0;

    if (totalSales.length > 0) {
      total_amount += totalSales[0].total_amount;
    } else {
      console.log("No delivered orders found.");
    }

    res.render("dashboard", {
      userData,
      orderData,
      productData,
      total_amount,
      order,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const customerPage = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });
    res.render("customer", { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};
const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    // res.json({message:"user blocked"});
    res.redirect("/admin/home");
  } catch (error) {
    console.log(error.message);
  }
};
const unblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    // res.json({message:"user blocked"});
    res.redirect("/admin/home");
  } catch (error) {
    console.log(error.message);
  }
};

//product section

const showProducts = async (req, res) => {
  try {
    const pdtinfo = await product.find();
    res.render("products", { products: pdtinfo });
    // res.render("products")
  } catch (error) {
    console.log(error.message);
  }
};
const addProductPage = async (req, res) => {
  try {
    res.render("add-product");
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res) => {
  try {
    const pdtID = req.body.pdtID;
    const title = req.body.title;
    const desc = req.body.desc;
    const price = req.body.price;
    const saleprice = req.body.saleprice;
    const category = req.body.category;
    const stock = req.body.stock;
    const size = req.body.size;
    var arrImages = [];
    for (let i = 0; i < req.files.length; i++) {
      arrImages[i] = req.files[i].filename;
    }
    //const image=req.file.filename
    const pdt = new product({
      pdtID: pdtID,
      title: title,
      desc: desc,
      price: price,
      stock: stock,
      saleprice: saleprice,
      category: category,
      size: size,
      image: arrImages,
    });
    if (
      !validator.isInt(price, { min: 0 }) ||
      !validator.isInt(saleprice, { min: 0 }) ||
      !validator.isInt(stock, { min: 0 })
    ) {
      return res
        .status(400)
        .json({
          error:
            "Price, Sale Price, and Stock must be non-negative integer values.",
        });
    }
    if (!pdtID || pdtID.trim() === "") {
      return res.status(400).json({ error: "Product ID is required." });
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!desc || desc.trim() === "") {
      return res.status(400).json({ error: "Description is required." });
    }
    if (!desc || price.trim() === "") {
      return res.status(400).json({ error: "price is required." });
    }
    if (!desc || saleprice.trim() === "") {
      return res.status(400).json({ error: "saleprice is required." });
    }
    if (!desc || stock.trim() === "") {
      return res.status(400).json({ error: "stock is required." });
    }
    if (!desc || category.trim() === "") {
      return res.status(400).json({ error: "category is required." });
    }
    if (!desc || size.trim() === "") {
      return res.status(400).json({ error: "size is required." });
    }
    const newProduct = await pdt.save();
    if (newProduct) {
      res.redirect("/admin/dashboard/products");
    } else {
      res.render("add-product", { message: "something went wrong!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editProductPage = async (req, res) => {
  try {
    const id = req.query.id;
    const pdtinfo = await product.findById({ _id: id });
    if (pdtinfo) {
      res.render("edit-product", { pdt: pdtinfo });
      // console.log(pdtinfo._id)
    } else {
      res.redirect("/admin/dashboard/products");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editProduct = async (req, res) => {
  try {
    const { id, pdtID, title, desc, price, saleprice, category, stock, size } =
      req.body;

    // Handle the image update only if new images were uploaded
    let updatedFields = {
      pdtID: pdtID,
      title: title,
      desc: desc,
      price: price,
      saleprice: saleprice,
      category: category,
      stock: stock,
      size: size,
    };
    if (req.files && req.files.length > 0) {
      const arrImages = req.files.map((file) => file.filename);
      updatedFields.image = arrImages;
    }
    if (
      !validator.isInt(price, { min: 0 }) ||
      !validator.isInt(saleprice, { min: 0 }) ||
      !validator.isInt(stock, { min: 0 })
    ) {
      return res
        .status(400)
        .json({
          error:
            "Price, Sale Price, and Stock must be non-negative integer values.",
        });
    }
    if (!pdtID || pdtID.trim() === "") {
      return res.status(400).json({ error: "Product ID is required." });
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!desc || desc.trim() === "") {
      return res.status(400).json({ error: "Description is required." });
    }
    if (!desc || price.trim() === "") {
      return res.status(400).json({ error: "price is required." });
    }
    if (!desc || saleprice.trim() === "") {
      return res.status(400).json({ error: "saleprice is required." });
    }
    if (!desc || stock.trim() === "") {
      return res.status(400).json({ error: "stock is required." });
    }
    if (!desc || category.trim() === "") {
      return res.status(400).json({ error: "category is required." });
    }
    if (!desc || size.trim() === "") {
      return res.status(400).json({ error: "size is required." });
    }

    const pdtinfo = await product.findByIdAndUpdate(id, {
      $set: updatedFields,
    });

    //const pdtinfo = await product.findByIdAndUpdate({ _id: req.body.id }, { $set: { pdtID: req.body.pdtID, title: req.body.title, desc: req.body.desc, price: req.body.price, saleprice: req.body.saleprice, category: req.body.category, stock: req.body.stock, size: req.body.size, image: req.files.filename } })

    res.redirect("/admin/dashboard/products");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    await product.deleteOne({ _id: id });
    res.redirect("/admin/dashboard/products");
  } catch (error) {
    console.log(error.message);
  }
};
//category section

const showCategories = async (req, res) => {
  try {
    const categoryinfo = await category.find();
    res.render("categories", { category: categoryinfo });
    // res.render("products")
  } catch (error) {
    console.log(error.message);
  }
};
const addCategoryPage = async (req, res) => {
  try {
    res.render("add-category");
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const name = req.body.name;

    const catgo = new category({
      name: name,
    });
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "name is required." });
    }
    const existingCategory = await category.findOne({ name: req.body.name });

    if (existingCategory) {
      return res.status(400).json({ error: "Category name already exists." });
    }
    const newCategory = await catgo.save();
    if (newCategory) {
      res.redirect("/admin/dashboard/categories");
    } else {
      res.render("add-category", { message: "something went wrong!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await category.deleteOne({ _id: id });
    res.redirect("/admin/dashboard/categories");
  } catch (error) {
    console.log(error.message);
  }
};
const editCategoryPage = async (req, res) => {
  try {
    const id = req.query.id;
    const Data = await category.findById({ _id: id });
    if (Data) {
      res.render("edit-category", { categoryData: Data });
    } else {
      res.redirect("/admin/dashboard/categories");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editCategory = async (req, res) => {
  try {
    const name = req.body.name;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "name is required." });
    }
    const existingCategory = await category.findOne({ name: req.body.name });

    if (existingCategory) {
      return res.status(400).json({ error: "Category name already exists." });
    }
    const categoryinfo = await category.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: { name: req.body.name } }
    );

    res.redirect("/admin/dashboard/categories");
  } catch (error) {
    console.log(error.message);
  }
};
const showCoupon = async (req, res) => {
  try {
    const couponinfo = await coupon.find();
    res.render("coupon", { coupon: couponinfo });
  } catch (error) {
    console.log(error.message);
  }
};
const addCouponPage = async (req, res) => {
  try {
    res.render("add-coupon");
  } catch (error) {
    console.log(error.message);
  }
};

const addCoupon = async (req, res) => {
  try {
    const name = req.body.name;

    const discount = req.body.discount;

    const Coupon = new coupon({
      name: name,
      discount: discount,
    });
    console.log(Coupon)
    const newCoupon = await Coupon.save();
    console.log(newCoupon)
    if (newCoupon) {
      res.redirect("/admin/coupon");
    } else {
      res.render("add-coupon", { message: "something went wrong!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    await coupon.deleteOne({ _id: id });
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};
const editCouponPage = async (req, res) => {
  try {
    const id = req.query.id;
    const Data = await coupon.findById({ _id: id });
    if (Data) {
      res.render("edit-coupon", { couponData: Data });
    } else {
      res.redirect("/admin/coupon");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editCoupon = async (req, res) => {
  try {
    const id = req.query.id;
  
    const name = req.body.name;
    const discount = req.body.discount;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "name is required." });
    }
    if (!discount || discount.trim() === "") {
      return res.status(400).json({ error: "discount is required." });
    }
    const existingCoupon = await coupon.findOne({ name: req.body.name });

    
    let updatedFields = {
      name: req.body.name,
      discount: req.body.discount,
    }
    const pdtinfo = await coupon.findByIdAndUpdate(id, {
      $set: updatedFields,
    });

    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
}
//orders

const showOrders = async (req, res) => {
  try {
    const order = await Order.find({}).sort({ createdAt: -1 });
    res.render("orders", { order });
  } catch (err) {
    console.log(err);
  }
};

const order_details = async (req, res) => {
  const { prdctId, ordId } = req.query;
  // console.log(prdctId)

  try {
    const order = await Order.findById({ _id: ordId });
    const order_prdct = order.items.find(
      (ord_prdct) => ord_prdct.item._id == prdctId
    );
    const prdct = await product.findById(
      { _id: prdctId },
      { title: 1, saleprice: 1, _id: 1 }
    );
    res.render("orderDetails", { order, order_prdct, prdct });
  } catch (err) {
    console.log(err);
  }
};

const change_status = async (req, res) => {
  const { ordId, prdctId, status } = req.body;
  const qty = parseInt(req.body.qty);
  console.log("qty:" + qty);
  const Id = req.session.user_id;
  try {
    const ord_data = await Order.findById({ _id: ordId });

    if (status === "refund-approved") {
      const data = await product.findById({ _id: prdctId });
      const changd_qty = data.stock + qty;
      data.stock = changd_qty;
      await data.save();

      await User.findByIdAndUpdate(
        { _id: Id },
        { $inc: { wallet: data.saleprice } }
      );
    }

    const prdct = ord_data.items.find(
      (prdct_data) => prdct_data.item._id == prdctId
    );
    prdct.status = status;
    ord_data.markModified("items");
    await ord_data.save();
    res.json({ message: "Status changed" });
  } catch (err) {
    console.log(err);
    res.json({ message: "Something went wrong" });
  }
};
//SALES REPORT

const salesReportLoad = async (req, res) => {
  try {
    
    const adminData = await User.find({ _id: req.session.admin});
    const orders = await Order.find()
  .populate({
    path: 'items.item',
    model: 'products',
  
    
    }).sort({ createdAt: -1 });


    res.render("sales_report", { orders ,adminData});

    orders.forEach((order) => {
      console.log(order);
    });
  } catch (err) {
    console.log(err);
  }
};
const salesReportSort = async (req, res) => {
  const { fromDate, toDate } = req.body;
  console.log(fromDate)
  try {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate({
      path: 'items.item',
      model: 'products',
    
      
      }).sort({ createdAt: -1 });
  
  


    res.render("sales_report", { orders});

    orders.forEach((order) => {
      console.log(order);
    });
  } catch (err) {
    console.log(err);
  }
};
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const { Console } = require("console");

// Define the route for downloading the sales report
// const salesReportDownload=async (req, res) => {
//   try {
//     // Generate the sales report data (you might need to fetch it from the database)
//     const salesReportData = await generateSalesReportData();

//     // Convert the data to a CSV format (you can use libraries like 'csv-writer' or 'json2csv')
//     const csvData = convertToCSV(salesReportData);

//     // Define the file path and name
//     const filePath = path.join(__dirname, 'sales_report.csv');

//     // Write the CSV data to a file
//     fs.writeFileSync(filePath, csvData, 'utf8');

//     // Send the file for download
//     res.download(filePath, 'sales_report.csv', (err) => {
//       if (err) {
//         console.error('Error downloading file:', err);
//         res.status(500).send('An error occurred during download.');
//       }

//       // Delete the file after download (optional)
//       fs.unlinkSync(filePath);
//     });
//   } catch (error) {
//     console.error('Error generating sales report:', error);
//     res.status(500).send('An error occurred.');
//   }
// }
const salesReportDownload=async (req, res) => {
  try {
    // Retrieve sales report data from the database
    const salesReportData = await generateSalesReportData();

    // Create a PDF document
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res); // Pipe the PDF to the response

    // Add content to the PDF
    pdfDoc.fontSize(14).text('Sales Report', { align: 'center' });
    pdfDoc.moveDown();

    // Create a table
    const table = {
        headers: ['Date', 'Product Name', 'Quantity', 'Price', 'Payment Method', 'Total Amount', 'Status'],
        rows: salesReportData.map(row => row.map(String))
    };

    // Draw the table
    drawTable(pdfDoc, table);

    // Finalize the PDF
    pdfDoc.end();
} catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).send('Internal server error');
}
};

// Function to generate sales report data (similar to previous code)
async function generateSalesReportData() {
  try {
    // Retrieve orders from the database
    const orders = await Order.find(/* Your query conditions */)
    .populate({
      path: 'items.item',
      model: 'products',
    
      
      }).sort({ createdAt: -1 });

    // Process orders and generate sales report data
    const salesReportData = [];
    
    orders.forEach((order, i) => {
        order.items.forEach((ordPrdct) => {
          if(ordPrdct.status=="delivered"){
            const rowData = [
                
                order.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-'),
                ordPrdct.item.title,
                ordPrdct.quantity,
                ordPrdct.item.saleprice,
                order.paymentMethod,
                ordPrdct.sub_total,
                ordPrdct.status
            ];
            salesReportData.push(rowData);
          }
        });
    });

    return salesReportData;
} catch (error) {
    throw error;
}
}

// Function to draw a table in the PDF
function drawTable(doc, table) {
const rowHeight = 20;
const tableWidth = 580;
const tableX = (doc.page.width - tableWidth) / 2;

doc.font('Helvetica-Bold').fontSize(10);

// Draw table headers
let y = doc.y + 10;
table.headers.forEach((header, index) => {
    doc.text(header, tableX + index * (tableWidth / table.headers.length), y, { width: tableWidth / table.headers.length, align: 'left' });
});

y += rowHeight;

// Draw table rows
table.rows.forEach((row, rowIndex) => {
  row.forEach((cell, index) => {
      doc.text(cell, tableX + index * (tableWidth / table.headers.length), y, { width: tableWidth / table.headers.length, align: 'left' });
  });
  y += rowHeight;

  // Draw a line after each row except the last one
  if (rowIndex < table.rows.length - 1) {
      doc.moveTo(tableX, y).lineTo(tableX + tableWidth, y).stroke();
      y += 5; // Add a little space between rows
  }
});

// doc.moveTo(tableX, y).lineTo(tableX + tableWidth, y).stroke();

doc.moveDown();
}

module.exports = {
  loadLogin,
  verifyLogin,
  adminDashboard,
  adminLogout,
  blockUser,
  unblockUser,
  showProducts,
  addProductPage,
  addProduct,
  editProductPage,
  editProduct,
  deleteProduct,
  showCategories,
  addCategoryPage,
  addCategory,
  deleteCategory,
  editCategoryPage,
  editCategory,
  customerPage,
  addCoupon,
  addCouponPage,
  showCoupon,
  editCoupon,
  editCouponPage,
  deleteCoupon,
  showOrders,
  order_details,
  change_status,
  salesReportLoad,
  salesReportSort,
  salesReportDownload,
  generateSalesReportData

};

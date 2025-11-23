import React, { useState, Fragment, useEffect, type JSX } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiPlus } from "react-icons/fi";
import { RichTextEditor } from "@mantine/rte";
import { getAllCategory } from "../../api/category/category";
import { deleteFiles, uploadFiles } from "../../api/uploadFile/uploadFile"; // API upload
import toast from "react-hot-toast";
import {
  addImageProduct,
  addProductVariants,
  createProduct,
  deleteAttributes,
  deleteAttributeValues,
  deleteImageProduct,
  updateAttributes,
  updateAttributeValues,
  updateProduct,
  updateProductVariants,
} from "../../api/product/product";

type ID = string;
const genId = (): ID => Math.random().toString(36).slice(2, 9);

interface AttributeValueUpdateRequest {
  id: number; // chỉ các giá trị đã có trong DB
  value?: string; // nếu user sửa
  image?: string; // nếu user thay ảnh mới
  removeImage?: boolean; // nếu user xoá ảnh
}

interface AttributeValueUpdateRequest {
  id: number;
  value?: string;
  image?: string;
  isRemoveImage?: boolean;
}

interface AttributeValue {
  id: ID;
  value: string;
  image?: string;
}
interface Category {
  id: number;
  name: string;
  parentId?: number;
  children?: Category[];
}
interface Attribute {
  id: ID;
  name: string;
  attributeValue: AttributeValue[];
}
interface VariantAttribute {
  attribute: string;
  value: string;
  image?: string;
}
export interface ProductVariant {
  id: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  price: number;
  variantAttributes?: VariantAttributeRequest[];
}

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productData?: {
    id: number;
    name?: string;
    description?: string;
    categoryId?: number;
    listPrice?: number;
    salePrice?: number;
    coverImage?: string;
    video?: string;
    imageProduct?: string[];
    attributes?: Attribute[];
    productVariant?: ProductVariant[];
    productStatus: string;
  };
  fetchData: () => void;
}

export interface VariantAttributeRequest {
  attribute: string; // tên phân loại, VD: "Color"
  value: string; // giá trị cụ thể, VD: "Đỏ"
}

// ==========================
// Product Variant Creation / Update Request
// ==========================
export interface ProductVariantCreationRequest {
  productId?: number | string;

  weight: number; // bắt buộc, > 0
  length: number; // bắt buộc, > 0
  width: number; // bắt buộc, > 0
  height: number; // bắt buộc, > 0
  price: number; // bắt buộc, > 0

  variantAttributes?: VariantAttributeRequest[];
}

// ==========================
// Product Variant FE state
// ==========================

// Cartesian product helper
function cartesian(arr: any[]) {
  if (!arr.length) return [];
  return arr.reduce(
    (a, b) => a.flatMap((x: any) => b.map((y: any) => [...x, y])),
    [[]]
  );
}

// Convert dataURL to File
const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

// Extract all dataURL images from description

export default function ProductDialog({
  isOpen,
  onClose,
  productData,
  fetchData,
}: ProductDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listPrice, setListPrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [coverImage, setCoverImage] = useState("");
  const [video, setVideo] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [imageProduct, setImageProduct] = useState<string[]>([]);
  const [removeAttributeId, setRemoveAttributeId] = useState<number[]>([]);
  const [removeAttributeValueId, setRemoveAttributeValueId] = useState<
    number[]
  >([]);
  const [weight, setWeight] = useState<number | "">("");
  const [length, setLength] = useState<number | "">("");
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const variantFields = [
    "price",
    "length",
    "width",
    "height",
    "weight",
  ] as const;

  useEffect(() => {
    if (attributes.length === 0) {
      return;
    }

    const attrValuesPerAttr = attributes.map((a) =>
      a.attributeValue
        .filter((v) => v.value.trim() !== "")
        .map((v) => ({ attribute: a.name, value: v.value, image: v.image }))
    );

    if (attrValuesPerAttr.some((arr) => arr.length === 0)) {
      setProductVariants([]);
      return;
    }

    const combos = cartesian(
      attributes.map(
        (a) =>
          a.attributeValue
            .filter((v) => v.value.trim() !== "")
            .map((v) => ({ ...v, attribute: a.name })) // giữ id
      )
    );

    setProductVariants((prevVariants) => {
      const variantMap = new Map(
        prevVariants.map((v) => [
          v.variantAttributes.map((va: any) => va.id).join("|"), // dùng id thay vì value
          v,
        ])
      );

      return combos.map((combo: any) => {
        const key = combo.map((c: any) => c.id).join("|");
        const existingVariant = variantMap.get(key);

        return {
          id: existingVariant?.id || genId(),
          price:
            existingVariant?.price ||
            (typeof salePrice === "number" ? salePrice : 0),
          length: existingVariant?.length,
          width: existingVariant?.width,
          height: existingVariant?.height,
          weight: existingVariant?.weight,
          variantAttributes: combo,
        };
      });
    });
  }, [attributes]);

  console.log("attribute : ", attributes);
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getAllCategory();
      if (res.success) setCategories(res.data);
      else console.error("Lấy danh mục lỗi:", res.error);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (productData) {
      console.log("productData ", productData);
      setName(productData.name || "");
      setDescription(productData.description || "");
      setCategoryId(productData.categoryId || null);
      setListPrice(productData.listPrice ?? "");
      setSalePrice(productData.salePrice ?? "");
      setCoverImage(productData.coverImage || "");
      setVideo(productData.video || "");
      setAttributes(productData.attributes || []);
      setProductVariants(productData.productVariant || []);
      setImageProduct(productData.imageProduct || []);
    } else {
      setName("");
      setDescription("");
      setCategoryId(null);
      setListPrice("");
      setSalePrice("");
      setCoverImage("");
      setImageProduct([]);
      setVideo("");
      setAttributes([]);
    }
  }, [productData]);
  console.log("productVariants : ", productVariants);

  const isReadOnly = productData?.productStatus === "INACTIVE";

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const uploadImage = (setter: (val: string) => void, file?: File) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File không được vượt quá 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVariantChange = (
    index: number,
    field: (typeof variantFields)[number],
    value: number | ""
  ) => {
    setProductVariants((prevVariants) => {
      const copy = [...prevVariants];
      (copy[index] as any)[field] = value === "" ? undefined : Number(value);
      return copy; // Cập nhật trạng thái biến thể
    });
  };
  const applyToAllVariants = (
    field: (typeof variantFields)[number],
    value: number | ""
  ) => {
    const copy = productVariants.map((v) => ({
      ...v,
      [field]: value === "" ? undefined : Number(value),
    }));
    setProductVariants(copy);
  };

  const findCategoryNameById = (id: number): string => {
    let name = "";
    const search = (cats: Category[]) => {
      for (let c of cats) {
        if (c.id === id) {
          name = c.name;
          return true;
        }
        if (
          (c as any).childCategory &&
          (c as any).childCategory.length &&
          search((c as any).childCategory)
        )
          return true;
      }
      return false;
    };
    search(categories);
    return name;
  };
  const renderCategoryTree = (cats: any[], level = 0): JSX.Element[] =>
    cats.flatMap((cat) => {
      const children =
        cat.childCategory && cat.childCategory.length > 0
          ? renderCategoryTree(cat.childCategory, level + 1)
          : [];
      return [
        <li
          key={`${cat.id}-${level}`}
          className="p-2 hover:bg-indigo-100 cursor-pointer"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            setCategoryId(cat.id);
            setCategoryDropdownOpen(false);
          }}
        >
          {cat.name}
        </li>,
        ...children,
      ];
    });

  const validateProduct = (product: {
    name: string;
    categoryId: number | null;
    listPrice: number | "";
    salePrice: number | "";
    coverImage: string;
    productVariant: ProductVariant[];
    attributes: Attribute[];
  }) => {
    if (!product.name.trim()) throw new Error("Vui lòng nhập tên sản phẩm");
    if (!product.categoryId) throw new Error("Vui lòng chọn danh mục");
    if (!product.listPrice || product.listPrice <= 0)
      throw new Error("Vui lòng nhập giá gốc > 0");
    if (!product.salePrice || product.salePrice <= 0)
      throw new Error("Vui lòng nhập giá sale > 0");
    if (product.listPrice < product.salePrice)
      throw new Error("Giá gốc phải >= giá sale");
    if (!product.coverImage) throw new Error("Vui lòng upload ảnh bìa");

    // Kiểm tra biến thể
    for (let v of product.productVariant) {
      if (v.price === undefined || v.price <= 0)
        throw new Error("Vui lòng nhập giá cho tất cả biến thể");
      if (
        [v.length, v.width, v.height, v.weight].some(
          (val) => val === undefined || val <= 0
        )
      )
        throw new Error(
          "Chiều dài, rộng, cao, trọng lượng phải > 0 cho tất cả biến thể"
        );
    }
    // Kiểm tra attributes
    for (let attr of product.attributes) {
      if (!attr.name.trim()) throw new Error("Tên thuộc tính không được trống");
      for (let val of attr.attributeValue) {
        if (!val.value.trim())
          throw new Error("Giá trị thuộc tính không được trống");
      }
    }
  };

  const handleSave = async () => {
    // --- Tạo object sản phẩm tạm để validate ---
    const productObj = {
      name,
      description,
      categoryId,
      listPrice: Number(listPrice) || 0,
      salePrice: Number(salePrice) || 0,
      coverImage,
      video,
      weight: weight ? Number(weight) : null,
      length: length ? Number(length) : null,
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      attributes,
      productVariant: productVariants,
    };
    setLoading(true);
    // --- Validate sync trước upload ---
    try {
      validateProduct(productObj);
    } catch (err) {
      return toast.error((err as Error).message); // toast sẽ hiện ngay
    }

    const uploadedUrls: string[] = [];

    try {
      // --- Cover ---
      let coverUrl = coverImage;
      console.log("Cover image:", coverImage);
      if (coverImage.startsWith("data:")) {
        const file = dataURLtoFile(coverImage, "cover.png");
        const [url] = await uploadFiles([file]);
        coverUrl = url;
        uploadedUrls.push(url);
      }
      console.log("Uploaded cover URL:", coverUrl);

      let videoUrl = video;
      if (video.startsWith("data:")) {
        const [url] = await uploadFiles([dataURLtoFile(video, "video.mp4")]);
        videoUrl = url;
        uploadedUrls.push(url);
      }

      let imageProductUrl = [...imageProduct]; // copy để thay thế từng phần tử

      for (let i = 0; i < imageProduct.length; i++) {
        const img = imageProduct[i];

        // Nếu là base64 -> upload
        if (img.startsWith("data:")) {
          const file = dataURLtoFile(img, `image_${i}.png`);
          const [url] = await uploadFiles([file]);

          // thay vào vị trí cũ
          imageProductUrl[i] = url;

          // lưu lại các URL mới nếu cần
          uploadedUrls.push(url);
        }
      }

      // --- Attribute images (upload riêng từng giá trị) ---
      const attrCopy: Attribute[] = JSON.parse(JSON.stringify(attributes)); // deep copy
      for (let attr of attrCopy) {
        for (let val of attr.attributeValue) {
          if (val.image && val.image.startsWith("data:")) {
            const fileName = val.id
              ? `attr_${val.id}.png`
              : `attr_${Date.now()}.png`;
            const [url] = await uploadFiles([
              dataURLtoFile(val.image, fileName),
            ]);
            val.image = url;
            uploadedUrls.push(url);
          }
        }
      }

      // --- Description images: upload từng file riêng ---
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = description;
      let counter = 0;
      tempDiv.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src");
        if (!src || src === "undefined") {
          console.warn("Removed broken image tag:", img);
          img.remove();
        }
      });

      for (const img of tempDiv.querySelectorAll("img")) {
        const src = img.getAttribute("src") || "";
        console.log("Description image src:", src);
        if (src.startsWith("data:")) {
          const file = dataURLtoFile(
            src,
            `desc_${Date.now()}_${counter++}.png`
          );
          try {
            const [url] = await uploadFiles([file]); // upload từng file một
            img.setAttribute("src", url); // thay ngay URL
            uploadedUrls.push(url); // lưu để rollback nếu cần
            console.log("Uploaded description image URL:", url);
            console.log("tempDiv after img upload:", tempDiv);
          } catch (err) {
            console.error("Upload description image lỗi:", err);
            throw err; // thoát để rollback nếu cần
          }
        }
      }

      const descriptionUrl = tempDiv.innerHTML; // HTML mới với URL đã thay

      // --- Tạo object sản phẩm cuối cùng ---
      const finalProduct = {
        ...productObj,
        description: descriptionUrl,
        coverImage: coverUrl,
        video: videoUrl,
        imageProduct: imageProductUrl,
        attributes: attrCopy,
      };

      console.log("Final product to save:", finalProduct);

      const res = await createProduct(finalProduct);
      if (!res.success) throw Error();
      fetchData();
      toast.success("Tạo sản phẩm thành công !");
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message);

      // Rollback nếu upload thất bại
      if (uploadedUrls.length) {
        try {
          await deleteFiles(uploadedUrls);
        } catch (deleteErr) {
          console.error("Rollback thất bại:", deleteErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!productData) return;

    const updatePayload: any = { id: productData.id };
    const uploadedUrls: string[] = [];
    const addImageList: string[] = [];
    const deleteImageList: string[] = [];

    // Hàm kiểm tra variant đã tồn tại trong productData chưa
    const checkVariantExistsInProductData = (
      productDataVariants: ProductVariant[],
      newVariant: ProductVariantCreationRequest
    ): boolean => {
      const newVariantSet = new Set(
        (newVariant.variantAttributes || []).map((v: any) => v.id) // dùng id thay vì value
      );

      for (const oldVar of productDataVariants) {
        const oldVarSet = new Set(
          (oldVar.variantAttributes || []).map((v: any) => v.id)
        );
        if (setsAreEqual(newVariantSet, oldVarSet)) return true;
      }
      return false;
    };

    const setsAreEqual = (a: Set<any>, b: Set<any>) => {
      if (a.size !== b.size) return false;
      for (const item of a) if (!b.has(item)) return false;
      return true;
    };
    setLoading(true);
    try {
      // ==========================
      // 1. Xử lý Cover Image
      // ==========================
      if (coverImage !== productData.coverImage) {
        if (coverImage?.startsWith("data:")) {
          const file = dataURLtoFile(coverImage, "cover.png");
          const [url] = await uploadFiles([file]);
          updatePayload.coverImage = url;
          uploadedUrls.push(url);
        } else if (!coverImage) {
          updatePayload.removeCoverImage = true;
        } else {
          updatePayload.coverImage = coverImage;
        }
      }

      // ==========================
      // 2. Xử lý Video
      // ==========================
      if (video !== productData.video) {
        if (video?.startsWith("data:")) {
          const [url] = await uploadFiles([dataURLtoFile(video, "video.mp4")]);
          updatePayload.video = url;
          uploadedUrls.push(url);
        } else if (!video) {
          updatePayload.removeVideo = true;
        } else {
          updatePayload.video = video;
        }
      }

      // ==========================
      // 3. Xử lý ImageProduct
      // ==========================
      const oldImages = productData.imageProduct || [];
      const newImages = imageProduct;

      // 3.1 Ảnh mới (dataURL) → upload → add
      for (const img of newImages) {
        if (img.startsWith("data:")) {
          const file = dataURLtoFile(img, `img_${Date.now()}.png`);
          const [url] = await uploadFiles([file]);
          addImageList.push(url);
          uploadedUrls.push(url);
        }
      }

      // 3.2 Ảnh bị xóa → delete
      for (const img of oldImages) {
        if (!newImages.includes(img)) {
          deleteImageList.push(img);
        }
      }

      if (addImageList.length > 0)
        await addImageProduct(productData.id, addImageList);
      if (deleteImageList.length > 0)
        await deleteImageProduct(productData.id, deleteImageList);

      // ==========================
      // 4. Xoá attribute & attributeValue
      // ==========================
      if (removeAttributeId.length > 0)
        await deleteAttributes(productData.id, removeAttributeId);
      if (removeAttributeValueId.length > 0)
        await deleteAttributeValues(productData.id, removeAttributeValueId);

      // ==========================
      // 5. Update attribute
      // ==========================
      const isAttributesChanged = (
        oldAttrs: Attribute[],
        newAttrs: Attribute[]
      ) => {
        if (oldAttrs.length !== newAttrs.length) return true;
        for (let i = 0; i < oldAttrs.length; i++)
          if (oldAttrs[i].name !== newAttrs[i].name) return true;
        return false;
      };

      if (isAttributesChanged(productData.attributes || [], attributes)) {
        const updateAttrPayload = attributes
          .filter((attr) => typeof attr.id === "number")
          .map((attr) => ({ id: attr.id, name: attr.name }));
        if (updateAttrPayload.length > 0)
          await updateAttributes(productData.id, updateAttrPayload);
      }

      // ==========================
      // 6. Update attributeValue
      // ==========================
      const getChangedAttributeValues = (
        oldAttrs: Attribute[],
        newAttrs: Attribute[]
      ) => {
        const changed: AttributeValueUpdateRequest[] = [];
        oldAttrs.forEach((oldAttr) => {
          const newAttr = newAttrs.find((a) => a.id === oldAttr.id);
          if (!newAttr) return;
          oldAttr.attributeValue.forEach((oldVal) => {
            if (typeof oldVal.id !== "number") return;
            const newVal = newAttr.attributeValue.find(
              (v) => v.id === oldVal.id
            );
            if (!newVal) return;
            const valChanged = oldVal.value !== newVal.value;
            const imgChanged =
              (oldVal.image || null) !== (newVal.image || null);
            if (valChanged || imgChanged) {
              changed.push({
                id: oldVal.id,
                value: newVal.value,
                image: newVal.image,
                isRemoveImage: !newVal.image,
              });
            }
          });
        });
        return changed;
      };

      const attrValuePayload = getChangedAttributeValues(
        productData.attributes || [],
        attributes
      );
      if (attrValuePayload.length > 0)
        await updateAttributeValues(productData.id, attrValuePayload);

      // ==========================
      // 7. Update & Add ProductVariant
      // ==========================
      const oldVariants = productData.productVariant || [];
      const variantsToUpdate: ProductVariantCreationRequest[] = [];
      const variantsToAdd: ProductVariantCreationRequest[] = [];

      productVariants.forEach((newVar: any) => {
        const exists = checkVariantExistsInProductData(oldVariants, newVar);
        if (exists) {
          const oldVar = oldVariants.find((v: any) =>
            setsAreEqual(
              new Set(
                (v.variantAttributes || []).map(
                  (a: any) => a.attribute.trim() + ":" + a.value.trim()
                )
              ),
              new Set(
                (newVar.variantAttributes || []).map(
                  (a: any) => a.attribute.trim() + ":" + a.value.trim()
                )
              )
            )
          );
          if (!oldVar) return;
          const changed =
            oldVar.price !== newVar.price ||
            oldVar.weight !== newVar.weight ||
            oldVar.height !== newVar.height ||
            oldVar.width !== newVar.width ||
            oldVar.length !== newVar.length;
          if (changed) {
            variantsToUpdate.push({
              productId: oldVar.id,
              price: newVar.price,
              weight: newVar.weight,
              height: newVar.height,
              width: newVar.width,
              length: newVar.length,
              variantAttributes: newVar.variantAttributes || [],
            });
          }
        } else {
          variantsToAdd.push(newVar);
        }
      });

      if (variantsToUpdate.length > 0)
        await updateProductVariants(productData.id, variantsToUpdate);
      if (variantsToAdd.length > 0)
        await addProductVariants(productData.id, variantsToAdd);

      // ==========================
      // 8. Xử lý Description
      // ==========================
      if (description !== productData.description) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = description;
        let counter = 0;
        for (const img of tempDiv.querySelectorAll("img")) {
          const src = img.getAttribute("src") || "";
          if (src.startsWith("data:")) {
            const file = dataURLtoFile(
              src,
              `desc_${Date.now()}_${counter++}.png`
            );
            const [url] = await uploadFiles([file]);
            img.setAttribute("src", url);
            uploadedUrls.push(url);
          }
        }
        updatePayload.description = tempDiv.innerHTML;
      }

      // ==========================
      // 9. Update các field cơ bản
      // ==========================
      if (name !== productData.name) updatePayload.name = name;
      if (categoryId !== productData.categoryId)
        updatePayload.categoryId = categoryId;
      if (listPrice !== productData.listPrice)
        updatePayload.listPrice = Number(listPrice);
      if (salePrice !== productData.salePrice)
        updatePayload.salePrice = Number(salePrice);

      // ==========================
      // 10. Gửi request cập nhật sản phẩm
      // ==========================
      await updateProduct(updatePayload);
      toast.success("Cập nhật thành công");
      setRemoveAttributeId([]);
      setRemoveAttributeValueId([]);
      closeModal();
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message);
      // rollback ảnh upload lỗi
      if (uploadedUrls.length) await deleteFiles(uploadedUrls);
    } finally {
      setLoading(false);
    }
  };

  const getVariantImage = (
    va: VariantAttribute,
    attributes: Attribute[]
  ): string | undefined => {
    // Tìm attribute tương ứng
    const attr = attributes.find((a) => a.name === va.attribute);
    if (!attr) return undefined;

    // Tìm giá trị tương ứng
    const val = attr.attributeValue.find((v) => v.value === va.value);
    return val?.image;
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategoryId(null);
    setListPrice("");
    setSalePrice("");
    setCoverImage("");
    setVideo("");
    setAttributes([]);
    setProductVariants([]);
    setCategoryDropdownOpen(false);
    setImageProduct([]);
    setRemoveAttributeId([]);
    setRemoveAttributeValueId([]);
    setWeight("");
    setLength("");
    setWidth("");
    setHeight("");
  };
  const closeModal = () => {
    resetForm();
    onClose();
  };

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      { id: genId(), name: "", attributeValue: [] },
    ]);
  };

  const removeAttribute = (ai: number) => {
    setAttributes((prev) => {
      const copy = [...prev];
      const removeAtt = copy[ai];
      if (removeAtt && typeof removeAtt.id === "number") {
        // Chỉ push id cũ từ database (number)
        setRemoveAttributeId((prevIds) => [...prevIds, removeAtt.id]);
      }

      copy.splice(ai, 1); // Xóa thuộc tính
      return copy;
    });
  };

  const addAttributeValueAt = (ai: number) => {
    setAttributes((prev) => {
      const copy = [...prev];
      copy[ai].attributeValue.push({ id: genId(), value: "" });
      return copy;
    });
  };

  const removeAttributeValueAt = (ai: number, vi: number) => {
    setAttributes((prev) => {
      const copy = [...prev];
      const removedVal = copy[ai].attributeValue[vi];

      if (removedVal && typeof removedVal.id === "number") {
        // Chỉ push id cũ từ database (number)
        setRemoveAttributeValueId((prevIds) => [...prevIds, removedVal.id]);
      }

      copy[ai].attributeValue.splice(vi, 1);
      return copy;
    });
  };

  useEffect(() => {
    if (productVariants.length === 1) {
      setWeight(productVariants[0].weight ?? "");
      setLength(productVariants[0].length ?? "");
      setWidth(productVariants[0].width ?? "");
      setHeight(productVariants[0].height ?? "");
    }
  }, [productVariants]);

  const boundVariant = productVariants.find(
    (v) => v.variantAttributes && v.variantAttributes.length === 0
  );

  useEffect(() => {
    if (boundVariant) {
      setWeight(boundVariant.weight ?? "");
      setLength(boundVariant.length ?? "");
      setWidth(boundVariant.width ?? "");
      setHeight(boundVariant.height ?? "");
    }
  }, [boundVariant]);

  const handlePhysicalChange = (
    field: "weight" | "length" | "width" | "height",
    value: number | ""
  ) => {
    // Cập nhật state riêng
    switch (field) {
      case "weight":
        setWeight(value);
        break;
      case "length":
        setLength(value);
        break;
      case "width":
        setWidth(value);
        break;
      case "height":
        setHeight(value);
        break;
    }

    // Nếu có boundVariant thì cập nhật trực tiếp vào productVariants
    if (boundVariant) {
      setProductVariants((prev) =>
        prev.map((v) =>
          v.id === boundVariant.id ? { ...v, [field]: value } : v
        )
      );
    }
  };
  console.log("boundVariant ", boundVariant);
  console.log("Remove attribute : ", removeAttributeId);
  console.log("Remove attribute value : ", removeAttributeValueId);
  console.log("Product variant ", productVariants);
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
          >
            <Dialog.Panel className="w-full max-w-6xl bg-white dark:bg-slate-100 p-6 rounded-xl shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {productData ? "Chi tiết sản phẩm" : "Tạo sản phẩm"}
                </h3>
                <button onClick={onClose} aria-label="close" className="p-1">
                  <FiX size={20} />
                </button>
              </div>
              {/* Body */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tên sản phẩm
                  </label>
                  <input
                    disabled={isReadOnly}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mô tả
                  </label>
                  <RichTextEditor
                    readOnly={isReadOnly}
                    value={description}
                    onChange={setDescription}
                  />
                </div>
                {/* Category & Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      Danh mục
                    </label>
                    <div
                      className="border rounded-xl w-full p-2 cursor-pointer"
                      onClick={() => {
                        if (!isReadOnly)
                          setCategoryDropdownOpen((prev) => !prev);
                      }}
                    >
                      {categoryId
                        ? findCategoryNameById(categoryId)
                        : "Chọn danh mục"}
                    </div>
                    {categoryDropdownOpen && (
                      <ul className="absolute z-10 w-full max-h-64 overflow-y-auto border rounded-xl bg-white shadow-lg mt-1">
                        {renderCategoryTree(categories)}
                      </ul>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Giá gốc
                    </label>
                    <input
                      disabled={isReadOnly}
                      type="number"
                      value={listPrice}
                      onChange={(e) =>
                        setListPrice(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Giá sale
                    </label>
                    <input
                      disabled={isReadOnly}
                      type="number"
                      value={salePrice}
                      onChange={(e) =>
                        setSalePrice(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full p-2 border rounded-xl"
                    />
                  </div>
                </div>
                {/* Cover & Video */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <label className="text-sm font-medium mb-1">Ảnh bìa</label>
                    <label className="cursor-pointer w-40 h-40 border rounded-xl flex items-center justify-center bg-slate-50 hover:bg-slate-100">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        "Upload"
                      )}
                      <input
                        disabled={isReadOnly}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          uploadImage(setCoverImage, e.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="text-sm font-medium mb-1">Video</label>
                    <label className="cursor-pointer w-40 h-40 border rounded-xl flex items-center justify-center bg-slate-50 hover:bg-slate-100">
                      {video ? (
                        <video
                          src={video}
                          controls
                          className="w-full h-full rounded-xl"
                        />
                      ) : (
                        "Upload"
                      )}
                      <input
                        disabled={isReadOnly}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) =>
                          uploadImage(setVideo, e.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ảnh sản phẩm
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {imageProduct.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-24 h-24 border rounded-xl overflow-hidden"
                      >
                        <img src={img} className="w-full h-full object-cover" />
                        {!isReadOnly && (
                          <button
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                            onClick={() => {
                              setImageProduct(
                                imageProduct.filter((_, i) => i !== idx)
                              );
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {!isReadOnly && (
                      <label className="cursor-pointer w-24 h-24 border rounded-xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-sm">
                        + Thêm
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (!files) return;
                            Array.from(files).forEach((file) => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setImageProduct((prev) => [
                                  ...prev,
                                  reader.result as string,
                                ]);
                              };
                              reader.readAsDataURL(file);
                            });
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Attributes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {!isReadOnly && !boundVariant && (
                      <>
                        <h4 className="font-medium">Thuộc tính</h4>
                        <button
                          onClick={addAttribute}
                          className="flex items-center gap-1 text-indigo-600 px-3 py-1 border rounded"
                        >
                          <FiPlus /> Thêm thuộc tính
                        </button>
                      </>
                    )}
                  </div>
                  <div className="space-y-3">
                    {attributes.map((attr, ai) => (
                      <div
                        key={attr.id}
                        className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-100"
                      >
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <input
                            disabled={isReadOnly}
                            placeholder="Tên thuộc tính"
                            value={attr.name}
                            onChange={(e) => {
                              const copy = [...attributes];
                              copy[ai].name = e.target.value;
                              setAttributes(copy);
                            }}
                            className="flex-1 p-2 border rounded-xl"
                          />
                          <div className="flex gap-2">
                            <button
                              disabled={isReadOnly}
                              onClick={() => addAttributeValueAt(ai)}
                              className="px-2 py-1 border rounded text-indigo-600"
                              title="Thêm giá trị"
                            >
                              <FiPlus />
                            </button>
                            <button
                              disabled={isReadOnly}
                              onClick={() => removeAttribute(ai)}
                              className="px-2 py-1 border rounded text-red-600"
                              title="Xoá thuộc tính"
                            >
                              X
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {attr.attributeValue.map((val, vi) => (
                            <div
                              key={val.id}
                              className="flex items-center gap-2 border p-2 rounded-xl bg-white relative"
                            >
                              <input
                                disabled={isReadOnly}
                                value={val.value}
                                onChange={(e) => {
                                  const copy = [...attributes];
                                  copy[ai].attributeValue[vi].value =
                                    e.target.value;
                                  setAttributes(copy);
                                }}
                                placeholder="Giá trị"
                                className="p-2 border rounded w-32"
                              />
                              {!val.image && (
                                <label className="cursor-pointer px-2 py-1 border rounded bg-slate-100 hover:bg-slate-200 text-sm">
                                  ⬆️
                                  <input
                                    disabled={isReadOnly}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file)
                                        uploadImage((v) => {
                                          const copy = [...attributes];
                                          copy[ai].attributeValue[vi].image = v;
                                          setAttributes(copy);
                                        }, file);
                                    }}
                                  />
                                </label>
                              )}
                              {val.image && (
                                <div className="relative">
                                  <img
                                    src={val.image}
                                    className="w-12 h-12 rounded object-cover border"
                                  />
                                  <button
                                    disabled={isReadOnly}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                                    onClick={() => {
                                      const copy = [...attributes];
                                      copy[ai].attributeValue[vi].image =
                                        undefined;
                                      setAttributes(copy);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                              <button
                                disabled={isReadOnly}
                                onClick={() => removeAttributeValueAt(ai, vi)}
                                className="text-sm text-red-600 ml-2"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(boundVariant || attributes.length === 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Weight (gram)
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) =>
                          handlePhysicalChange(
                            "weight",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        value={length}
                        onChange={(e) =>
                          handlePhysicalChange(
                            "length",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) =>
                          handlePhysicalChange(
                            "width",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) =>
                          handlePhysicalChange(
                            "height",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Variants Table */}
                {productVariants.length > 0 && attributes.length > 0 && (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full border-collapse border">
                      <thead>
                        <tr className="bg-slate-200">
                          {attributes.map((a) => (
                            <th key={a.id} className="border p-2 text-left">
                              {a.name || "-"}
                            </th>
                          ))}
                          {variantFields.map((f) => (
                            <th key={f} className="border p-2">
                              <div className="flex flex-col gap-1">
                                <span>{f}</span>
                                <input
                                  disabled={isReadOnly}
                                  type="number"
                                  placeholder="Áp dụng tất cả"
                                  className="w-full p-1 border rounded"
                                  onChange={(e) =>
                                    applyToAllVariants(
                                      f,
                                      e.target.value === ""
                                        ? ""
                                        : Number(e.target.value)
                                    )
                                  }
                                />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {productVariants.map((v, idx) => (
                          <tr
                            key={v.id}
                            className="odd:bg-white even:bg-slate-50"
                          >
                            {v.variantAttributes.map((va, vi) => (
                              <td key={vi} className="border p-2">
                                {getVariantImage(va, attributes) && (
                                  <img
                                    src={getVariantImage(va, attributes)}
                                    alt=""
                                    className="inline-block w-8 h-8 object-cover rounded mr-2"
                                  />
                                )}
                                {va.value}
                              </td>
                            ))}
                            {variantFields.map((f) => (
                              <td key={f} className="border p-2">
                                <input
                                  disabled={isReadOnly}
                                  type="number"
                                  value={(v as any)[f] ?? ""}
                                  onChange={(e) =>
                                    handleVariantChange(
                                      idx,
                                      f,
                                      e.target.value === ""
                                        ? ""
                                        : Number(e.target.value)
                                    )
                                  }
                                  className="w-full p-1 border rounded"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-xl"
                >
                  Hủy
                </button>
                {!isReadOnly && (
                  <button
                    onClick={productData ? handleUpdate : handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2"
                    disabled={loading} // disable khi đang loading
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                        ></path>
                      </svg>
                    )}
                    {loading ? "Đang lưu..." : "Lưu"}
                  </button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

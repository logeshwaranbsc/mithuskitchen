import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Database,
  ExternalLink
} from 'lucide-react';
import { api, uploadFoodImage } from '../../services/api';
import { FoodItem, MealCategory } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const AdminFoods: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryType, setDietaryType] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceInRupees, setPriceInRupees] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [calories, setCalories] = useState('350');
  const [servingSize, setServingSize] = useState('1 portion');
  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<{ fileName?: string; s3Url?: string } | null>(null);

  // Load Categories
  const { data: categories = [] } = useQuery<MealCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res: any = await api.get('/menus/categories');
      return res.data;
    },
  });

  // Load Foods
  const { data: foods = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ['foods'],
    queryFn: async () => {
      const res: any = await api.get('/foods');
      return res.data;
    },
  });

  // Save Food Mutation
  const saveFoodMutation = useMutation({
    mutationFn: async () => {
      const base_price = Math.round(parseFloat(priceInRupees) * 100);
      const payload = {
        name,
        description,
        category_id: categoryId || categories[0]?.id,
        base_price,
        image_url: imageUrl,
        is_veg: isVeg,
        is_available: isAvailable,
        is_active: true,
        calories: parseInt(calories) || undefined,
        serving_size: servingSize,
      };

      if (editingFood) {
        return await api.put(`/foods/admin/${editingFood.id}`, payload);
      } else {
        return await api.post('/foods/admin', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      setShowModal(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to save food item');
    },
  });

  // Delete Food Mutation
  const deleteFoodMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/foods/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });

  const resetForm = () => {
    setEditingFood(null);
    setName('');
    setDescription('');
    setPriceInRupees('');
    setImageUrl('');
    setIsVeg(true);
    setIsAvailable(true);
    setCalories('350');
    setServingSize('1 portion');
    setFormError('');
    setUploadError('');
    setUploadSuccessInfo(null);
  };

  const handleOpenAdd = (defaultDietVeg: boolean = true) => {
    resetForm();
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsVeg(defaultDietVeg);
    setImageUrl(defaultDietVeg 
      ? 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
      : 'https://txzgtgvfdhcazqlelolt.supabase.co/storage/v1/object/public/mithu/foods/chicken-curry-meal.jpg'
    );
    setShowModal(true);
  };

  const handleOpenEdit = (food: FoodItem) => {
    setEditingFood(food);
    setName(food.name);
    setDescription(food.description);
    setCategoryId(food.category_id);
    setPriceInRupees((food.base_price / 100).toString());
    setImageUrl(food.image_url);
    setIsVeg(food.is_veg);
    setIsAvailable(food.is_available);
    setCalories(food.calories?.toString() || '350');
    setServingSize(food.serving_size || '1 portion');
    setFormError('');
    setUploadError('');
    setUploadSuccessInfo(null);
    setShowModal(true);
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError('');
      setUploadSuccessInfo(null);

      const result = await uploadFoodImage(file);
      setImageUrl(result.url);
      setUploadSuccessInfo({
        fileName: result.fileName,
        s3Url: result.s3Url,
      });
    } catch (err: any) {
      setUploadError(err.message || 'Image upload to Supabase storage failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredFoods = foods.filter((f) => {
    if (selectedCategory !== 'all' && f.category_id !== selectedCategory) return false;
    if (dietaryType === 'veg' && !f.is_veg) return false;
    if (dietaryType === 'non-veg' && f.is_veg) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  });

  const vegCount = foods.filter(f => f.is_veg).length;
  const nonVegCount = foods.filter(f => !f.is_veg).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820]">Food Item Management</h1>
          <p className="text-xs text-[#6B756D] mt-1">
            Add dishes, manage prices, upload images to Supabase Storage (<span className="font-semibold text-[#202820]">mithu</span> bucket), and control real-time availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenAdd(true)} 
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Veg Item
          </button>
          <button 
            onClick={() => handleOpenAdd(false)} 
            className="bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Non-Veg Item
          </button>
        </div>
      </div>

      {/* Storage info pill */}
      <div className="bg-[#F7FAF7] border border-[#E5EAE5] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B756D]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#237A45]" />
          <span>Storage Bucket: <strong className="text-[#202820]">mithu</strong></span>
          <span className="text-gray-300">|</span>
          <span className="truncate max-w-xs sm:max-w-md">S3 Endpoint: <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#E5EAE5]">txzgtgvfdhcazqlelolt.storage.supabase.co/storage/v1/s3</code></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {vegCount} Veg Dishes
          </span>
          <span className="text-xs font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
            {nonVegCount} Non-Veg Dishes
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5EAE5] shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B756D] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes or ingredients..."
            className="input-field pl-10 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Dietary Filter */}
          <div className="inline-flex p-1 rounded-xl bg-[#F7FAF7] border border-[#E5EAE5]">
            <button
              onClick={() => setDietaryType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                dietaryType === 'all'
                  ? 'bg-white text-[#202820] shadow-xs'
                  : 'text-[#6B756D] hover:text-[#202820]'
              }`}
            >
              All ({foods.length})
            </button>
            <button
              onClick={() => setDietaryType('veg')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dietaryType === 'veg'
                  ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                  : 'text-[#6B756D] hover:text-[#202820]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Veg ({vegCount})
            </button>
            <button
              onClick={() => setDietaryType('non-veg')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dietaryType === 'non-veg'
                  ? 'bg-red-100 text-red-900 shadow-xs'
                  : 'text-[#6B756D] hover:text-[#202820]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Non-Veg ({nonVegCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field text-xs py-2 w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Foods Table */}
      <div className="card-white rounded-3xl bg-white border border-[#E5EAE5] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7FAF7] text-[#6B756D] font-bold border-b border-[#E5EAE5]">
              <tr>
                <th className="py-3 px-4">Dish Details</th>
                <th className="py-3 px-4">Diet</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE5]">
              {filteredFoods.map((food) => {
                const category = categories.find((c) => c.id === food.category_id);
                return (
                  <tr key={food.id} className="hover:bg-[#F7FAF7] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <img
                            src={food.image_url}
                            alt={food.name}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                            onError={(e) => {
                              // Fallback image
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute -top-1 -right-1 bg-white p-0.5 rounded-sm border border-gray-200 shadow-xs">
                            {food.is_veg ? (
                              <div className="w-3 h-3 border border-emerald-600 flex items-center justify-center rounded-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                              </div>
                            ) : (
                              <div className="w-3 h-3 border border-red-600 flex items-center justify-center rounded-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-[#202820] flex items-center gap-1.5">
                            {food.name}
                          </div>
                          <p className="text-[#6B756D] text-[11px] line-clamp-1 max-w-xs">{food.description}</p>
                          {food.calories && (
                            <span className="text-[10px] text-gray-500 font-medium">
                              {food.calories} kcal • {food.serving_size || '1 portion'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {food.is_veg ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Veg
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-red-600"></span> Non-Veg
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#202820] bg-[#EAF5EC] text-[#237A45] px-2.5 py-1 rounded-md text-[11px]">
                        {category?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-base text-[#237A45]">
                      {formatCurrency(food.base_price)}
                    </td>

                    <td className="py-3.5 px-4">
                      {food.is_available ? (
                        <span className="inline-flex items-center gap-1 text-[#237A45] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Sold Out
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(food)}
                        className="p-1.5 rounded-lg border border-[#E5EAE5] text-[#202820] hover:bg-gray-100"
                        title="Edit Food Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete food item "${food.name}"?`)) {
                            deleteFoodMutation.mutate(food.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-[#E5EAE5] text-red-600 hover:bg-red-50"
                        title="Delete Food Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Food Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E5EAE5] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#202820]">
                {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Veg / Non-Veg Selector */}
              <div>
                <label className="block font-semibold mb-1.5 text-[#202820]">Dietary Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsVeg(true)}
                    className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                      isVeg
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-[#E5EAE5] text-[#6B756D] hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-4 h-4 border-2 border-emerald-600 flex items-center justify-center rounded-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    </div>
                    <span>Pure Veg</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVeg(false)}
                    className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                      !isVeg
                        ? 'bg-red-50 border-red-600 text-red-800 ring-2 ring-red-500/20'
                        : 'bg-white border-[#E5EAE5] text-[#6B756D] hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center rounded-xs">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    </div>
                    <span>Non-Veg Meal</span>
                  </button>
                </div>
              </div>

              {/* Dish Name */}
              <div>
                <label className="block font-semibold mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isVeg ? "e.g. Claypot Veg Dum Biryani" : "e.g. Chettinad Chicken Dum Biryani"}
                  className="input-field text-xs"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold mb-1">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-field text-xs"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.default_delivery_time?.slice(0, 5)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block font-semibold mb-1">Price in Rupees (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={priceInRupees}
                  onChange={(e) => setPriceInRupees(e.target.value)}
                  placeholder="e.g. 180"
                  className="input-field text-xs"
                />
              </div>

              {/* Food Image Uploader (Supabase Storage: mithu) */}
              <div className="p-3 bg-[#F7FAF7] border border-[#E5EAE5] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#202820] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#237A45]" />
                    <span>Food Image (Bucket: <strong className="text-[#237A45]">mithu</strong>)</span>
                  </label>
                  <span className="text-[10px] text-[#6B756D]">PNG, JPG, WebP</span>
                </div>

                {/* File Upload Trigger */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    id="food-image-file"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 bg-white hover:bg-gray-50 flex-1 justify-center"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#237A45]" />
                        <span>Uploading to Supabase Storage...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#237A45]" />
                        <span>Upload Image to Storage</span>
                      </>
                    )}
                  </button>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
                )}

                {uploadSuccessInfo && (
                  <div className="text-[11px] text-[#237A45] bg-[#EAF5EC] p-2 rounded-lg space-y-0.5">
                    <p className="font-semibold">✓ Uploaded to Supabase bucket: mithu</p>
                    <p className="text-[10px] text-gray-500 truncate">S3: {uploadSuccessInfo.s3Url}</p>
                  </div>
                )}

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] text-[#6B756D] mb-1">
                    Or Image URL (Supabase CDN / Web Link):
                  </label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="input-field text-xs bg-white"
                  />
                </div>

                {/* Preview Thumbnail */}
                {imageUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-[#E5EAE5] bg-gray-100 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="text-[11px] text-[#6B756D] space-y-0.5 truncate">
                      <p className="font-semibold text-[#202820]">Image Preview</p>
                      <p className="text-[10px] truncate max-w-xs">{imageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe ingredients, cooking style, and accompaniments..."
                  className="input-field text-xs"
                />
              </div>

              {/* Calories & Serving Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Serving Size</label>
                  <input
                    type="text"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              {/* Available Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E5EAE5]">
                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 accent-[#237A45] rounded"
                  />
                  <span>Mark as Available in Kitchen Today</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-3">
              <button
                onClick={() => saveFoodMutation.mutate()}
                disabled={saveFoodMutation.isPending || !name || !priceInRupees || isUploading}
                className="btn-primary flex-1 text-xs py-2.5"
              >
                {saveFoodMutation.isPending ? 'Saving...' : 'Save Food Item'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-outline text-xs py-2.5 px-4">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

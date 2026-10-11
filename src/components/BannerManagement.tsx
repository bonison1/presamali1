import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Image, Edit, Plus, Trash } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface BannerSetting {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  is_active: boolean;
  display_order: number;
  is_published: boolean;
  banner_height?: number;
  banner_width?: number;
  text_position?: string;
  image_position?: string;
  overlay_opacity?: number;
}

const BannerManagement = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<BannerSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSetting | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banner_settings')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching banners:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch banners',
          variant: 'destructive',
        });
        return;
      }

      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch banners',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner: BannerSetting) => {
    setEditingBanner({
      ...banner,
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      secondary_button_text: banner.secondary_button_text || '',
      secondary_button_link: banner.secondary_button_link || '',
      banner_height: banner.banner_height ?? 350,
      banner_width: banner.banner_width ?? 100,
      text_position: banner.text_position || 'center',
      image_position: banner.image_position || 'center',
      overlay_opacity: banner.overlay_opacity ?? 60,
    });
    setEditingImages(banner.image_url ? [banner.image_url] : []);
  };

  const handleSave = async (banner: BannerSetting) => {
    setSaving(true);
    try {
      const updatedBanner = {
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: editingImages.length > 0 ? editingImages[0] : banner.image_url,
        // Empty text = button hidden on the site
        button_text: (banner.button_text || '').trim(),
        button_link: (banner.button_link || '').trim(),
        secondary_button_text: (banner.secondary_button_text || '').trim(),
        secondary_button_link: (banner.secondary_button_link || '').trim(),
        is_active: banner.is_active,
        is_published: banner.is_published,
        banner_height: banner.banner_height,
        banner_width: banner.banner_width,
        text_position: banner.text_position,
        image_position: banner.image_position,
        overlay_opacity: banner.overlay_opacity,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('banner_settings')
        .update(updatedBanner)
        .eq('id', banner.id);

      if (error) {
        throw error;
      }

      setBanners(banners.map((b) => (b.id === banner.id ? { ...b, ...updatedBanner } : b)));
      setEditingBanner(null);
      setEditingImages([]);
      toast({
        title: 'Success',
        description: 'Banner updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update banner',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const maxOrder = Math.max(...banners.map((b) => b.display_order), 0);
      const newBanner = {
        title: 'New Banner',
        subtitle: 'Banner Subtitle',
        image_url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1920&h=600&fit=crop',
        // Buttons are optional: start with none
        button_text: '',
        button_link: '',
        secondary_button_text: '',
        secondary_button_link: '',
        is_active: true,
        is_published: true,
        display_order: maxOrder + 1,
        banner_height: 350,
        banner_width: 100,
        text_position: 'center',
        image_position: 'center',
        overlay_opacity: 40,
      };

      const { data, error } = await supabase
        .from('banner_settings')
        .insert([newBanner])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setBanners([...banners, data]);
      toast({
        title: 'Success',
        description: 'Banner created successfully',
      });
    } catch (error: any) {
      console.error('Error creating banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to create banner',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      const { error } = await supabase.from('banner_settings').delete().eq('id', id);

      if (error) {
        throw error;
      }

      setBanners(banners.filter((b) => b.id !== id));
      toast({
        title: 'Success',
        description: 'Banner deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete banner',
        variant: 'destructive',
      });
    }
  };

  const swapOrder = async (a: BannerSetting, b: BannerSetting) => {
    try {
      const results = await Promise.all([
        supabase.from('banner_settings').update({ display_order: b.display_order }).eq('id', a.id),
        supabase.from('banner_settings').update({ display_order: a.display_order }).eq('id', b.id),
      ]);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      await fetchBanners();
    } catch (error) {
      console.error('Error reordering banners:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder banners',
        variant: 'destructive',
      });
    }
  };

  const moveUp = async (banner: BannerSetting) => {
    const currentIndex = banners.findIndex((b) => b.id === banner.id);
    if (currentIndex <= 0) return;
    await swapOrder(banner, banners[currentIndex - 1]);
  };

  const moveDown = async (banner: BannerSetting) => {
    const currentIndex = banners.findIndex((b) => b.id === banner.id);
    if (currentIndex >= banners.length - 1) return;
    await swapOrder(banner, banners[currentIndex + 1]);
  };

  const handleInputChange = (field: keyof BannerSetting, value: string | boolean | number) => {
    if (!editingBanner) return;

    setEditingBanner({
      ...editingBanner,
      [field]: value,
    });
  };

  const getPreviewStyles = () => {
    if (!editingBanner) return {};

    return {
      height: `${editingBanner.banner_height}px`,
      width: `${editingBanner.banner_width}%`,
      backgroundImage: `url(${editingImages[0] || editingBanner.image_url})`,
      backgroundPosition: editingBanner.image_position,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    };
  };

  const getTextPositionStyles = () => {
    if (!editingBanner) return '';

    const positions: Record<string, string> = {
      'top-left': 'items-start justify-start',
      'top-center': 'items-start justify-center',
      'top-right': 'items-start justify-end',
      'center-left': 'items-center justify-start',
      center: 'items-center justify-center',
      'center-right': 'items-center justify-end',
      'bottom-left': 'items-end justify-start',
      'bottom-center': 'items-end justify-center',
      'bottom-right': 'items-end justify-end',
    };

    return positions[editingBanner.text_position || 'center'] || positions.center;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading banners...</div>
      </div>
    );
  }

  const hasPrimary = !!editingBanner?.button_text?.trim();
  const hasSecondary = !!editingBanner?.secondary_button_text?.trim();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Banner Management</span>
            </CardTitle>
            <CardDescription>Manage multiple banners that appear on the homepage</CardDescription>
          </div>
          <Button onClick={handleCreate} disabled={saving}>
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </CardHeader>
      </Card>

      {banners.map((banner, index) => (
        <Card key={banner.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Banner {index + 1}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveUp(banner)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveDown(banner)}
                  disabled={index === banners.length - 1}
                >
                  ↓
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(banner)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(banner.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
              <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Title:</strong> {banner.title}
              </div>
              <div>
                <strong>Subtitle:</strong> {banner.subtitle}
              </div>
              <div>
                <strong>Active:</strong> {banner.is_active ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Published:</strong> {banner.is_published ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Primary button:</strong> {banner.button_text?.trim() ? banner.button_text : 'Hidden'}
              </div>
              <div>
                <strong>Secondary button:</strong>{' '}
                {banner.secondary_button_text?.trim() ? banner.secondary_button_text : 'Hidden'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-4 w-full max-w-6xl max-h-screen overflow-y-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Edit Banner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Live Preview Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Live Preview</Label>
                  <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                    <div className="relative rounded-lg overflow-hidden mx-auto" style={getPreviewStyles()}>
                      <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: (editingBanner.overlay_opacity ?? 60) / 100 }}
                      />
                      <div className={`absolute inset-0 flex text-white p-8 ${getTextPositionStyles()}`}>
                        <div className="text-center space-y-4 max-w-4xl">
                          <h1 className="text-2xl md:text-4xl font-bold">{editingBanner.title}</h1>
                          <h2 className="text-lg md:text-2xl font-light text-gray-300">
                            {editingBanner.subtitle}
                          </h2>
                          {(hasPrimary || hasSecondary) && (
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                              {hasPrimary && (
                                <span className="bg-white text-black px-6 py-2 rounded-lg font-semibold inline-block">
                                  {editingBanner.button_text}
                                </span>
                              )}
                              {hasSecondary && (
                                <span className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold inline-block">
                                  {editingBanner.secondary_button_text}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Image */}
                <div className="space-y-2">
                  <Label htmlFor="banner-image">Banner Image</Label>
                  <ImageUpload
                    images={editingImages}
                    onImagesChange={setEditingImages}
                    maxImages={1}
                    maxSizePerImageMB={5}
                  />
                </div>

                {/* Size Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Banner Size</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="banner-height">Height: {editingBanner.banner_height}px</Label>
                        <Slider
                          id="banner-height"
                          min={200}
                          max={600}
                          step={10}
                          value={[editingBanner.banner_height ?? 350]}
                          onValueChange={(value) => handleInputChange('banner_height', value[0])}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="banner-width">Width: {editingBanner.banner_width}%</Label>
                        <Slider
                          id="banner-width"
                          min={50}
                          max={100}
                          step={5}
                          value={[editingBanner.banner_width ?? 100]}
                          onValueChange={(value) => handleInputChange('banner_width', value[0])}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Position Controls</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="text-position">Text Position</Label>
                        <Select
                          value={editingBanner.text_position || 'center'}
                          onValueChange={(value) => handleInputChange('text_position', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-center">Top Center</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="center-left">Center Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="center-right">Center Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-center">Bottom Center</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image-position">Image Position</Label>
                        <Select
                          value={editingBanner.image_position || 'center'}
                          onValueChange={(value) => handleInputChange('image_position', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                            <SelectItem value="top left">Top Left</SelectItem>
                            <SelectItem value="top right">Top Right</SelectItem>
                            <SelectItem value="bottom left">Bottom Left</SelectItem>
                            <SelectItem value="bottom right">Bottom Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay Opacity */}
                <div className="space-y-2">
                  <Label htmlFor="overlay-opacity">Overlay Opacity: {editingBanner.overlay_opacity}%</Label>
                  <Slider
                    id="overlay-opacity"
                    min={0}
                    max={100}
                    step={5}
                    value={[editingBanner.overlay_opacity ?? 60]}
                    onValueChange={(value) => handleInputChange('overlay_opacity', value[0])}
                    className="w-full"
                  />
                </div>

                {/* Text Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Main Title (H1)</Label>
                    <Input
                      id="title"
                      value={editingBanner.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle (H2)</Label>
                    <Input
                      id="subtitle"
                      value={editingBanner.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    />
                  </div>
                </div>

                {/* Button Content (optional) */}
                <div className="space-y-1">
                  <Label className="text-lg font-semibold">Buttons (optional)</Label>
                  <p className="text-sm text-gray-500">
                    Leave a button's text empty to hide it. Leave both empty for a banner with no buttons.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="button-text">Primary Button Text</Label>
                    <Input
                      id="button-text"
                      placeholder="Empty = hidden"
                      value={editingBanner.button_text}
                      onChange={(e) => handleInputChange('button_text', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="button-link">Primary Button Link</Label>
                    <Input
                      id="button-link"
                      placeholder="/shop"
                      value={editingBanner.button_link}
                      disabled={!hasPrimary}
                      onChange={(e) => handleInputChange('button_link', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondary-button-text">Secondary Button Text</Label>
                    <Input
                      id="secondary-button-text"
                      placeholder="Empty = hidden"
                      value={editingBanner.secondary_button_text}
                      onChange={(e) => handleInputChange('secondary_button_text', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-button-link">Secondary Button Link</Label>
                    <Input
                      id="secondary-button-link"
                      placeholder="/about"
                      value={editingBanner.secondary_button_link}
                      disabled={!hasSecondary}
                      onChange={(e) => handleInputChange('secondary_button_link', e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={editingBanner.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is-active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-published"
                      checked={editingBanner.is_published}
                      onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                    />
                    <Label htmlFor="is-published">Published</Label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingBanner(null);
                      setEditingImages([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => handleSave(editingBanner)} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
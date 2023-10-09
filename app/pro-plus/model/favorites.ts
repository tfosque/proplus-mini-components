import { MultiVariationData } from "./template-item";

export interface GetFavoritesResponse {
  result: FavoritesResult | null;
  success: boolean;
  messages: Message[] | null;
}

interface Message {
  type: string;
  value: string;
  code: string | null;
  key?: any | null;
}

interface UserName {
  firstName: string;
  lastName: string;
}

export interface FavoritesResult {
  accountName: string;
  lastModifiedUser: UserName;
  createdDate: string;
  createdByUser: UserName;
  lastModifiedDate: string;
  accountLegacyId: string;
  isAccountClosed: boolean;
  categorySort: boolean;
  favoritesItemsCount: number;
  favoritesItems: FavoritesItem[];
}

export interface ImageUrl {
  thumbnail: string;
  large: string;
  swatch: string;
}

interface Category {
  categoryName: string;
  categoryId: string;
}

export interface FavoritesItem {
  favoritesItemId: string;
  itemNumber: string;
  quantity?: number;
  nickName?: string;
  productImageUrl?: string;
  productOnErrorImageUrl?: string;
  productOrItemDescription?: string;
  productOrItemNumber?: string;
  internalProductName?: string;
  unitPrice?: number;
  unitOfMeasure?: string;
  vendorColorId?: string;
  available?: boolean;
  imageUrl?: ImageUrl;
  pdpUrl?: string;
  multiVariationData?: MultiVariationData;
  mainCategory: string;
  category: Category;
}

export type UpdateFavoritesRequest =
  | CreateFavoritesRequestBody
  | UpdateFavoritesRequestBody
  | DeleteFavoritesRequestBody;

export interface CreateFavoritesRequestBody {
  account: string;
  action: 'createItem';
  categorySort?: boolean;
  items: FavoritesCreateItem[];
}

export interface UpdateFavoritesRequestBody {
  account: string;
  action: 'updateItem';
  categorySort: boolean;
  items: FavoritesUpdateItem[];
}

export interface DeleteFavoritesRequestBody {
  account: string;
  action: 'deleteItem';
  categorySort?: boolean;
  items: FavoritesDeleteItemWithItemId[] | FavoritesDeleteItemWithItemNumber[];
}

export interface FavoritesCreateItem {
  itemNumber: string;
  unitOfMeasure: string;
  nickName?: string;
  quantity: number;
  matchColor?: string;
  matchMFG?: string;
}

export interface FavoritesUpdateItem {
  itemId: string;
  itemNumber: string;
  unitOfMeasure: string | null;
  nickName?: string;
  quantity: number | null;
  matchColor?: string;
  matchMFG?: string;
}

export interface FavoritesDeleteItemWithItemId {
  itemId: string;
}

export interface FavoritesDeleteItemWithItemNumber {
  itemNumber: string;
  unitOfMeasure?: string | null
}

export interface UpdateFavoritesResult {
  result: any | null;
  success: boolean;
  messages: Message[] | null
}

// src/models/index.ts

import { sequelize } from '../config/database';

// Import modeli
import { User } from './user';
import { Vendor } from './vendor';
import { Couple } from './couple';
import { ServiceCategory } from './serviceCategory';
import { VendorListing } from './vendorListing';
import { ListingTemplate } from './listingTemplate';
import { Media } from './media';
import { Review } from './review';
import { FilterCategory } from './filterCategory';
import { FilterOption } from './filterOption';
import { ListingFilter } from './listingFilter';
import { Calendar } from './calendar';
import { Conversation } from './conversation';
import { Message } from './message';
import { GuestGroup } from './guestGroup';
import { GuestList } from './guestList';
import { Table } from './table';
import { TableAssignment } from './tableAssignment';
import { Favorite } from './favorite';
import { Log } from './log';
import { Notification } from './notification';
import { NotificationRecipient } from './notificationRecipient';
import { UserNotificationSetting } from './userNotificationSetting';
import { PaymentRecord } from './paymentRecord';
import { PromotionType } from './promotionType';
import { Promotion } from './promotion';
import { Discount } from './discount';
import { ListingStat } from './listingStat';
import { SystemStat } from './systemStat';
import { GeneratedReport } from './generatedReport';
import { Device } from './devices';


// Definiowanie relacji między modelami

// User <-> Vendor
User.hasOne(Vendor, { foreignKey: 'vendorId', as: 'vendorProfile' });
Vendor.belongsTo(User, { foreignKey: 'vendorId', as: 'user' });

// User <-> Couple
User.hasOne(Couple, { foreignKey: 'coupleId', as: 'coupleProfile' });
Couple.belongsTo(User, { foreignKey: 'coupleId', as: 'user' });

// User <-> Device
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Vendor <-> VendorListing
Vendor.hasMany(VendorListing, { foreignKey: 'vendorId', as: 'listings' });
VendorListing.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

// ServiceCategory <-> VendorListing
ServiceCategory.hasMany(VendorListing, { foreignKey: 'categoryId', as: 'listings' });
VendorListing.belongsTo(ServiceCategory, { foreignKey: 'categoryId', as: 'category' });

// VendorListing <-> Media
VendorListing.hasMany(Media, { foreignKey: 'listingId', as: 'media' });
Media.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });

// VendorListing <-> Review
VendorListing.hasMany(Review, { foreignKey: 'listingId', as: 'reviews' });
Review.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// VendorListing <-> Calendar
VendorListing.hasMany(Calendar, { foreignKey: 'listingId', as: 'calendarEntries' });
Calendar.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });

// Vendor <-> ListingTemplate
Vendor.hasMany(ListingTemplate, { foreignKey: 'vendorId', as: 'templates' });
ListingTemplate.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

// ServiceCategory <-> ListingTemplate
ServiceCategory.hasMany(ListingTemplate, { foreignKey: 'categoryId', as: 'templates' });
ListingTemplate.belongsTo(ServiceCategory, { foreignKey: 'categoryId', as: 'category' });

// ServiceCategory <-> FilterCategory
ServiceCategory.hasMany(FilterCategory, { foreignKey: 'serviceCategoryId', as: 'filterCategories' });
FilterCategory.belongsTo(ServiceCategory, { foreignKey: 'serviceCategoryId', as: 'serviceCategory' });

// FilterCategory <-> FilterOption
FilterCategory.hasMany(FilterOption, { foreignKey: 'filterCategoryId', as: 'filterOptions' });
FilterOption.belongsTo(FilterCategory, { foreignKey: 'filterCategoryId', as: 'filterCategory' });

// VendorListing <-> ListingFilter
VendorListing.hasMany(ListingFilter, { foreignKey: 'listingId', as: 'listingFilters' });
ListingFilter.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });

// FilterOption <-> ListingFilter
FilterOption.hasMany(ListingFilter, { foreignKey: 'filterOptionId', as: 'listingFilters' });
ListingFilter.belongsTo(FilterOption, { foreignKey: 'filterOptionId', as: 'filterOption' });

// User <-> Conversation (jako user1 i user2)
User.hasMany(Conversation, { foreignKey: 'user1Id', as: 'conversationsAsUser1' });
User.hasMany(Conversation, { foreignKey: 'user2Id', as: 'conversationsAsUser2' });
Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });

// Conversation <-> Message
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User <-> Message (jako sender i receiver)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Couple <-> GuestGroup
Couple.hasMany(GuestGroup, { foreignKey: 'coupleId', as: 'guestGroups' });
GuestGroup.belongsTo(Couple, { foreignKey: 'coupleId', as: 'couple' });

// Couple <-> GuestList
Couple.hasMany(GuestList, { foreignKey: 'coupleId', as: 'guestList' });
GuestList.belongsTo(Couple, { foreignKey: 'coupleId', as: 'couple' });

// GuestGroup <-> GuestList
GuestGroup.hasMany(GuestList, { foreignKey: 'groupId', as: 'guests' });
GuestList.belongsTo(GuestGroup, { foreignKey: 'groupId', as: 'group' });

// Couple <-> Table
Couple.hasMany(Table, { foreignKey: 'coupleId', as: 'tables' });
Table.belongsTo(Couple, { foreignKey: 'coupleId', as: 'couple' });

// Table <-> TableAssignment
Table.hasMany(TableAssignment, { foreignKey: 'tableId', as: 'assignments' });
TableAssignment.belongsTo(Table, { foreignKey: 'tableId', as: 'table' });

// GuestList <-> TableAssignment
GuestList.hasMany(TableAssignment, { foreignKey: 'guestId', as: 'tableAssignments' });
TableAssignment.belongsTo(GuestList, { foreignKey: 'guestId', as: 'guest' });

// User <-> Favorite
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// VendorListing <-> Favorite
VendorListing.hasMany(Favorite, { foreignKey: 'listingId', as: 'favorites' });
Favorite.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });

// User <-> Log
User.hasMany(Log, { foreignKey: 'userId', as: 'logs' });
Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notification <-> NotificationRecipient
Notification.hasMany(NotificationRecipient, { foreignKey: 'notificationId', as: 'recipients' });
NotificationRecipient.belongsTo(Notification, { foreignKey: 'notificationId', as: 'notification' });

// User <-> NotificationRecipient
User.hasMany(NotificationRecipient, { foreignKey: 'userId', as: 'notifications' });
NotificationRecipient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> UserNotificationSetting
User.hasMany(UserNotificationSetting, { foreignKey: 'userId', as: 'notificationSettings' });
UserNotificationSetting.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> PaymentRecord
User.hasMany(PaymentRecord, { foreignKey: 'userId', as: 'payments' });
PaymentRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// VendorListing <-> PaymentRecord
VendorListing.hasMany(PaymentRecord, { foreignKey: 'listingId', as: 'payments' });
PaymentRecord.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });

// Promotion <-> PaymentRecord
Promotion.hasMany(PaymentRecord, { foreignKey: 'promotionId', as: 'payments' });
PaymentRecord.belongsTo(Promotion, { foreignKey: 'promotionId', as: 'promotion' });

// Discount <-> PaymentRecord
Discount.hasMany(PaymentRecord, { foreignKey: 'discountId', as: 'payments' });
PaymentRecord.belongsTo(Discount, { foreignKey: 'discountId', as: 'discount' });

// VendorListing <-> Promotion
VendorListing.hasMany(Promotion, { foreignKey: 'listingId', as: 'promotions' });
Promotion.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });

// PromotionType <-> Promotion
PromotionType.hasMany(Promotion, { foreignKey: 'promotionTypeId', as: 'promotions' });
Promotion.belongsTo(PromotionType, { foreignKey: 'promotionTypeId', as: 'promotionType' });

// VendorListing <-> ListingStat
VendorListing.hasMany(ListingStat, { foreignKey: 'listingId', as: 'stats' });
ListingStat.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });

// Conversation <-> VendorListing
VendorListing.hasMany(Conversation, { foreignKey: 'listingId', as: 'conversations' });
Conversation.belongsTo(VendorListing, { foreignKey: 'listingId', as: 'listing' });


// Eksport wszystkich modeli
export {
  sequelize,
  User,
  Device,
  Vendor,
  Couple,
  ServiceCategory,
  VendorListing,
  ListingTemplate,
  Media,
  Review,
  FilterCategory,
  FilterOption,
  ListingFilter,
  Calendar,
  Conversation,
  Message,
  GuestGroup,
  GuestList,
  Table,
  TableAssignment,
  Favorite,
  Log,
  Notification,
  NotificationRecipient,
  UserNotificationSetting,
  PaymentRecord,
  PromotionType,
  Promotion,
  Discount,
  ListingStat,
  SystemStat,
  GeneratedReport,
};

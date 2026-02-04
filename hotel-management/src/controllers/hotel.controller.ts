import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { getDBTimestamps } from "../utils/getDBTimestamps";

export const createHotel = asyncHandler(async (req, res) => {
  const createdHotel = await prisma.hotel.create({
    data: {
      ...req.body,
      ownerId: req.user?.id,
      ...getDBTimestamps(true),
    },
  });

  if (!createdHotel) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_RESPONSE"));
  }

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(true, createdHotel, null));
});

export const addHotelRoom = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  if (!hotelId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(new ApiResponse(false, null, "HOTEL_NOT_FOUND"));
  }

  const existingRoom = await prisma.room.findFirst({
    where: { roomNumber: req.body.roomNumber, hotelId: hotelId.toString() },
  });

  if (existingRoom) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "ROOM_ALREADY_EXISTS"));
  }

  const insertedRoom = await prisma.room.create({
    data: { ...req.body, hotelId, ...getDBTimestamps(true) },
  });

  if (!insertedRoom) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_ERROR"));
  }

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(true, insertedRoom, null));
});

type HotelWhere = {
  city?: {
    equals?: string;
    mode?: "insensitive";
  };
  country?: {
    equals?: string;
    mode?: "insensitive";
  };
  rating?: {
    gte?: number;
  };
};

type RoomWhere = {
  pricePerNight?: {
    gte?: number;
    lte?: number;
  };
};

export const getHotels = asyncHandler(async (req, res) => {
  const { city, country, minPrice, maxPrice, minRating } = req.query;

  const where: HotelWhere = {};

  city && (where.city = { equals: city.toString(), mode: "insensitive" });
  country &&
    (where.country = { equals: country.toString(), mode: "insensitive" });
  minRating && (where.rating = { gte: Number(minRating) });

  const roomWhere: RoomWhere = {};

  if (minPrice || maxPrice) {
    roomWhere.pricePerNight = {};
    if (minPrice) roomWhere.pricePerNight.gte = Number(minPrice);
    if (maxPrice) roomWhere.pricePerNight.lte = Number(maxPrice);
  }

  if (Object.keys(roomWhere).length > 0) {
    (where as any).rooms = {
      some: roomWhere,
    };
  }

  const hotelList = await prisma.hotel.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      country: true,
      amenities: true,
      rating: true,
      totalReviews: true,
      rooms: {
        where: roomWhere,
        orderBy: { pricePerNight: "asc" },
        take: 1,
        select: { pricePerNight: true },
      },
    },
  });

  const finalList = hotelList.map(({ rooms, ...hotel }) => ({
    ...hotel,
    minPricePerNight: rooms[0]?.pricePerNight ?? 0,
  }));

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(true, finalList, null));
});

export const getHotelDetails = asyncHandler(async (req, res) => {
  const hotel = await prisma.hotel.findFirst({
    where: { id: req.params.hotelId?.toString() },
    select: {
      id: true,
      name: true,
      ownerId: true,
      description: true,
      city: true,
      country: true,
      amenities: true,
      rating: true,
      totalReviews: true,
      rooms: {
        select: {
          id: true,
          roomNumber: true,
          roomType: true,
          pricePerNight: true,
          maxOccupancy: true,
        },
      },
    },
  });

  if (!hotel) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(new ApiResponse(false, null, "HOTEL_NOT_FOUND"));
  }

  return res.status(StatusCodes.OK).json(new ApiResponse(true, hotel, null));
});

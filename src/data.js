import axios from "axios";
import moment from "moment-timezone";
import groupBy from "lodash/groupBy";
import keys from "lodash/keys";
import sortBy from "lodash/sortBy";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL;

const getSlots = async () => {
  const slotData = await axios
    .get(API_URL + "/sessions")
    .then(({ data }) => data.data);
  return slotData;
};

const getLastUpdated = async () => {
  const lastUpdated = await axios
    .get(API_URL + "/snapshots/latest")
    .then(({ data }) => data.data.created_at);
  return lastUpdated;
};

export const getGyms = async () => {
  const gyms = await axios.get(API_URL + "/gyms").then(({ data }) => data.data);
  return gyms;
};

export const querySlots = async ({ gymSlug, gymName, date = moment() }) => {
  const slots = await getSlots();
  const lastUpdated = await getLastUpdated();
  return formatSlots(
    slots.filter((slot) => slot.gym.slug === gymSlug),
    gymName,
    lastUpdated
  );
};

export const escapeString = (string) =>
  string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

const formatSlots = (slots, gymName, lastUpdated) => {
  const groupedSlots = groupBy(
    slots.map((slot) => ({
      ...slot,
      date: moment(slot.starts_at).format("dddd, DD MMM"),
    })),
    "date"
  );
  return `Here are the slots for *${escapeString(gymName)}*:\n\n${sortBy(
    keys(groupedSlots),
    [
      function (o) {
        return moment(o, "dddd, DD MMM");
      },
    ]
  )
    .map(
      (date) =>
        `*${date}*\n${escapeString(
          sortBy(groupedSlots[date], "starts_at")
            .map(
              (slot) =>
                `${slot.spaces > 0 ? "✅" : "❌"} \`${moment(
                  slot.starts_at
                ).format("hh:mmA")}: ${slot.spaces}\``
            )
            .join("\n")
        )}`
    )
    .join("\n\n")}\n\nLast updated ${moment(lastUpdated).fromNow()}`;
};

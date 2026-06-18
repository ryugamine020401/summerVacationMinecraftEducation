import { world, system } from "@minecraft/server";

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;

  if (block.typeId === "chemistry_plus:potassium_metal_block") {
    player.sendMessage("事件偵測：你放置了鉀金屬方塊");
  }
});

world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const item = event.itemStack;

  if (!item) {
    return;
  }

  if (item.typeId === "chemistry_plus:potassium_metal") {
    player.sendMessage("事件偵測：你使用了鉀金屬");
  }
});
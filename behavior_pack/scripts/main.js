import { world, system, EntityComponentTypes } from "@minecraft/server";

const ALKALI_METALS = [
  {
    name: "鋰",
    itemId: "chemistry_plus:lithium_metal",
    blockId: "chemistry_plus:lithium_metal_block",
    explosionRadius: 2,
    waterMessage: "鋰金屬掉入水中：產生輕微爆炸！"
  },
  {
    name: "鈉",
    itemId: "chemistry_plus:sodium_metal",
    blockId: "chemistry_plus:sodium_metal_block",
    explosionRadius: 4,
    waterMessage: "鈉金屬掉入水中：發生爆炸！"
  },
  {
    name: "鉀",
    itemId: "chemistry_plus:potassium_metal",
    blockId: "chemistry_plus:potassium_metal_block",
    explosionRadius: 8,
    waterMessage: "鉀金屬掉入水中：發生大爆炸！"
  },
  {
    name: "銣",
    itemId: "chemistry_plus:rubidium_metal",
    blockId: "chemistry_plus:rubidium_metal_block",
    explosionRadius: 10,
    waterMessage: "銣金屬掉入水中：發生劇烈爆炸！"
  },
  {
    name: "銫",
    itemId: "chemistry_plus:cesium_metal",
    blockId: "chemistry_plus:cesium_metal_block",
    explosionRadius: 12,
    waterMessage: "銫金屬掉入水中：發生超劇烈爆炸！"
  },
  {
    name: "鍅",
    itemId: "chemistry_plus:francium_metal",
    blockId: "chemistry_plus:francium_metal_block",
    explosionRadius: 14,
    waterMessage: "鍅金屬掉入水中：發生毀滅性爆炸！"
  }
];

const METAL_BY_ITEM_ID = new Map(ALKALI_METALS.map((metal) => [metal.itemId, metal]));
const METAL_BY_BLOCK_ID = new Map(ALKALI_METALS.map((metal) => [metal.blockId, metal]));

const REACTION_TAG = "chemistry_plus_alkali_metal_reacted";
const CHECK_INTERVAL_TICKS = 5;

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;
  const metal = METAL_BY_BLOCK_ID.get(block.typeId);

  if (!metal) {
    return;
  }

  if (metal.blockId === "chemistry_plus:potassium_metal_block") {
    player.sendMessage(player.name + " 放置了鉀金屬方塊，請小心！");
    player.sendMessage("事件偵測：你放置了鉀金屬方塊");
    return;
  }

  player.sendMessage(player.name + " 放置了" + metal.name + "金屬方塊，請小心！");
  player.sendMessage("事件偵測：你放置了" + metal.name + "金屬方塊");
});

function getItemStackFromEntity(entity) {
  try {
    const itemComponent = entity.getComponent(EntityComponentTypes.Item);

    if (!itemComponent) {
      return undefined;
    }

    return itemComponent.itemStack;
  } catch (error) {
    return undefined;
  }
}

function triggerAlkaliMetalWaterExplosion(itemEntity, metal) {
  if (itemEntity.hasTag(REACTION_TAG)) {
    return;
  }

  itemEntity.addTag(REACTION_TAG);

  const dimension = itemEntity.dimension;
  const location = itemEntity.location;

  world.sendMessage(metal.waterMessage);

  try {
    itemEntity.remove();
  } catch (error) {
    // 如果移除失敗，也不要讓整個 script 中斷
  }

  try {
    dimension.createExplosion(
      {
        x: location.x,
        y: location.y,
        z: location.z
      },
      metal.explosionRadius,
      {
        breaksBlocks: false,
        causesFire: false,
        allowUnderwater: true
      }
    );
  } catch (error) {
    world.sendMessage("爆炸效果執行失敗，請檢查 Content Log。");
  }
}

function checkDroppedAlkaliMetalItems() {
  const dimension = world.getDimension("overworld");

  const itemEntities = dimension.getEntities({
    type: "minecraft:item"
  });

  for (const itemEntity of itemEntities) {
    if (!itemEntity.isValid) {
      continue;
    }

    if (itemEntity.hasTag(REACTION_TAG)) {
      continue;
    }

    const itemStack = getItemStackFromEntity(itemEntity);

    if (!itemStack) {
      continue;
    }

    const metal = METAL_BY_ITEM_ID.get(itemStack.typeId);

    if (!metal) {
      continue;
    }

    if (!itemEntity.isInWater) {
      continue;
    }

    triggerAlkaliMetalWaterExplosion(itemEntity, metal);
  }
}

system.runInterval(() => {
  checkDroppedAlkaliMetalItems();
}, CHECK_INTERVAL_TICKS);

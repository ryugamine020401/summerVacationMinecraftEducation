import { world, system, EntityComponentTypes } from "@minecraft/server";

const POTASSIUM_ITEM_ID = "chemistry_plus:potassium_metal";
const POTASSIUM_BLOCK_ID = "chemistry_plus:potassium_metal_block";

const REACTION_TAG = "chemistry_plus_potassium_reacted";
const EXPLOSION_RADIUS = 8;
const CHECK_INTERVAL_TICKS = 5;

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;

  if (block.typeId === POTASSIUM_BLOCK_ID) {
    player.sendMessage(player.name + " 放置了鉀金屬方塊，請小心！");
    player.sendMessage("事件偵測：你放置了鉀金屬方塊");
  }
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

function triggerPotassiumWaterExplosion(itemEntity) {
  if (itemEntity.hasTag(REACTION_TAG)) {
    return;
  }

  itemEntity.addTag(REACTION_TAG);

  const dimension = itemEntity.dimension;
  const location = itemEntity.location;

  world.sendMessage("鉀金屬掉入水中：發生大爆炸！");

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
      EXPLOSION_RADIUS,
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

function checkDroppedPotassiumItems() {
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

    if (itemStack.typeId !== POTASSIUM_ITEM_ID) {
      continue;
    }

    if (!itemEntity.isInWater) {
      continue;
    }

    triggerPotassiumWaterExplosion(itemEntity);
  }
}

system.runInterval(() => {
  checkDroppedPotassiumItems();
}, CHECK_INTERVAL_TICKS);
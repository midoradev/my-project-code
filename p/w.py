#--------------------------------------------------------------------------------------------------------#

import discord
import asyncpg
import time
import datetime
from discord.ext import commands
from os.path import join, dirname
from dotenv import load_dotenv
from os import environ
from utils.useful import try_catch
from utils.game_classes import GlobalPlayers

dotenv_path = join(dirname(__file__), "bot_settings.env")
load_dotenv(dotenv_path)


class LilaBot(commands.Bot):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
        super().__init__(command_prefix=self.get_prefix, **kwargs)

    @property
    def stella(self):
        return self.get_user(self.owner_id)

    async def db_fill(self):
        prefixes = await self.pg_con.fetch("SELECT * FROM prefixes")
        self.cache_prefix = {data["snowflake_id"]: set(data["prefixes"]) for data in prefixes}

    def load_cog(self):
        for cog in self.loading_cog:
            ext = "cogs." if cog != "jishaku" else ""
            if error := try_catch(self.load_extension, f"{ext}{cog}"):
                print("Error while loading:", cog, "\n", error)
            else:
                print(cog, "is now loaded")

    async def get_prefix(self, message):
        query = "INSERT INTO prefixes VALUES ($1, $2) ON CONFLICT (snowflake_id) DO NOTHING"
        cur_prefix = {self.default_prefix}
        if message.author.id in self.cache_prefix:
            cur_prefix = cur_prefix.union(self.cache_prefix[message.author.id])
        else:
            await self.pg_con.execute(query, message.author.id, [self.default_prefix])
            self.cache_prefix.update({message.author.id: {self.default_prefix}})

        if message.guild:
            if message.guild.id in self.cache_prefix:
                cur_prefix = cur_prefix.union(self.cache_prefix[message.guild.id])
            else:
                await self.pg_con.execute(query, message.guild.id, [self.default_prefix])
                self.cache_prefix.update({message.guild.id: {self.default_prefix}})
        return cur_prefix

    def starter(self):
        try:
            print("Connecting to database...")
            start = time.time()
            loop_pg = self.loop.run_until_complete(asyncpg.create_pool(database=self.db,
                                                                       user=self.user_db,
                                                                       password=self.pass_db))
            print(f"Connected to the database ({time.time() - start})s")
        except Exception as e:
            print("Could not connect to database.")
            print(e)
            return
        else:
            self.uptime = datetime.datetime.utcnow()
            self.pg_con = loop_pg
            self.loop.run_until_complete(self.db_fill())
            self.load_cog()
            print("Bot running...   (", self.uptime, ")")
            self.run(self.token)


intents = discord.Intents.default()
intents.typing = False
intents.members = True

bot_data = {"intents": intents,
            "color": 0xFFB5E8,
            "token": environ.get("TOKEN"),
            "tester": bool(environ.get("TESTER")),
            "default_prefix": environ.get("PREFIX"),
            "db": environ.get("DATABASE"),
            "user_db": environ.get("USER"),
            "pass_db": environ.get("PASSWORD"),
            "owner_id": 591135329117798400,
            "loading_cog": ("admin", "jishaku", "casual_games"),
            "error_color": 0xF67280,
            "positive_color": 0xDCEDC2,
            "INVITE_REACT": {True: "<:checkmark:753619798021373974>", False: "<:crossmark:753620331851284480>", None: ""},
            "global_player": GlobalPlayers()
            }
list_Nones = ["cache_prefix", "uptime", "pg_con"]
bot_data.update(dict.fromkeys(list_Nones))
bot = LilaBot(**bot_data)


@bot.event
async def on_connect():
    bot.connected = datetime.datetime.utcnow()
    print("Online: ", bot.connected)

@bot.event
async def on_message(message):
    # on_message event is handled in admin cog
    return


@bot.event
async def on_ready():
    print("Cache is ready")

bot.starter()

#--------------------------------------------------------------------------------------------------------#

import discord
from discord.ext import commands
from discord.ext.commands import CheckFailure, UserInputError


class InvalidPrefix(CheckFailure):
    def __init__(self, argument):
        super().__init__(argument)


class CurrentlyPlaying(CheckFailure):
    def __init__(self, argument, user_playing, game):
        super().__init__(argument)
        self.user_playing = user_playing
        self.game = game


class AnotherGame(CheckFailure):
    def __init__(self, author_id):
        super().__init__(message="**{}** is already playing. This isn't possible.".format(author_id))


class Connect4ColumnFull(UserInputError):
    def __init__(self, player, column):
        super().__init__(message="**{}**, column number `{}` is full! Choose another column.".format(player, column))
        self.player = player
        self.column = column

#--------------------------------------------------------------------------------------------------------#

import discord
from discord.ext import commands
from utils.errors import InvalidPrefix, CurrentlyPlaying


class ValidPrefix(commands.Converter):
    def __init__(self, del_mode=False):
        self.del_mode = del_mode

    async def convert(self, ctx, argument):
        if len(argument) <= 10:
            return argument

        if not self.del_mode:
            raise InvalidPrefix(f"`{argument}` is bigger than 10 characters.")

        snowflake = ctx.guild.id if ctx.guild and ctx.author.guild_permissions.administrator else ctx.author.id
        prefix = ctx.bot.cache_prefix[snowflake]
        if argument in prefix:
            return argument
        else:
            process_prefix = "`, `".join(prefix) if isinstance(prefix, set) else prefix
            raise InvalidPrefix(f"`{argument}` does not exist in your prefix list. "
                                f"Your current prefix list is {process_prefix}")


class FakeMember(discord.Member):
    def __init__(self):
        pass


class Player(commands.MemberConverter, FakeMember):
    @classmethod
    async def convert(cls, ctx, argument):
        member = await commands.MemberConverter().convert(ctx, argument)
        if game := ctx.bot.global_player.get_player(member.id):
            argument = f"{member} is currently waiting for a request of {game} game.", member, game
            if game.status:
                argument = f"{member} is currently playing {game}", member, game

            raise CurrentlyPlaying(*argument)
        return member

#--------------------------------------------------------------------------------------------------------#

from __future__ import annotations
import asyncio
import discord
import random
import datetime
import numpy as np
from utils.errors import AnotherGame
from utils.useful import make_async, get_winner
from typing import Union
from PIL import Image, ImageDraw, ImageFont
from utils.errors import Connect4ColumnFull
from utils.useful import BaseEmbed
from io import BytesIO
from humanize import precisedelta
from collections import namedtuple


class GlobalPlayers:
    __slots__ = ("games",)

    def __init__(self):
        # Author will have the Game object
        # While the player will point to the author's id
        self.games = {}

    def get_player(self, player_id):
        if player_id in self.games:
            game = self.games[player_id]
            if isinstance(game, int):
                return self.games[game]
            else:
                return game

    def add(self, ctx, players_id, game):
        if ctx.author.id in self.games:
            raise AnotherGame(ctx.author.id)  # if coded correctly, this isn't possible to hit
        new_game = game(ctx, players_id)
        self.games.update({ctx.author.id: new_game})
        for player_id in players_id:
            if player_id in self.games:
                raise AnotherGame(player_id)
            self.games.update({player_id: ctx.author.id})
        return new_game

    def remove(self, game: Union[Game, int]):
        if isinstance(game, int):
            # if int, it must be an author id
            game = self.games.pop(game)
            for player_id in game.players_id:
                self.games.pop(player_id, None)
        else:
            self.games.pop(game.author_id)
            for player_id in game.players_id:
                self.games.pop(player_id, None)

    def __len__(self):
        return len(self.games)


class Game:
    __slots__ = ("ctx", "created_at", "author_id", "players_id", "status", "_players", "ROOT", "ended_at")

    def __init__(self, ctx, players_id: list, status: bool):
        self.ctx = ctx
        self.created_at = datetime.datetime.utcnow()
        self.ended_at = None
        self.author_id = ctx.author.id
        self.players_id = players_id
        self.status = status
        self._players = None
        self.ROOT = "resources"

    @property
    def author(self):
        return self.ctx.bot.get_user(self.author_id)

    @property
    def players(self):
        if not self._players:
            return [self.ctx.bot.get_user(player_id) for player_id in self.players_id + [self.author_id]]
        return self._players

    @property
    def game(self):
        return self.__class__.__name__

    def __contains__(self, player):
        auth, players = (self.author_id, self.players_id) if isinstance(player, int) else (self.author, self.players)
        return player in players or player == auth

    def __str__(self):
        return self.game


class TicTacToe(Game):
    __slots__ = ("turn", "cols", "rows", "win", "NONE", "board", "new", "FOLDER", "CHANGE",
                 "previous_image", "first_time", "colors", "WIN_MESSAGE", "DRAW_MESSAGE", "GAME_TIME", "moves", "move")

    def __init__(self, ctx, second_id, cols=3, rows=3, win_requirements=3):
        super().__init__(ctx, second_id, False)
        self.turn = random.randint(0, len(second_id) + 1)
        self.cols = cols
        self.rows = rows
        self.win = win_requirements
        self.NONE = -1
        self.CHANGE = 1
        self.board = [[self.NONE] * rows for _ in range(cols)]
        self.new = (-1, -1)
        self.FOLDER = f"{self.ROOT}/connect_4"
        self.previous_image = None
        self.first_time = True
        self.colors = (0x000001, 0xfffffe)
        self.WIN_MESSAGE = "`{0}` wins Connect 4 against `{1}`!"
        self.DRAW_MESSAGE = "Looks like all the columns are full. The game ends with a draw!"
        self.GAME_TIME = "Game lasted {}"
        self.moves = {}
        self.move = 0

    def insert(self, column, row):
        pass

    def change_turn(self):
        self.turn ^= self.CHANGE
        return self.turn

    @property
    def current_player(self):
        return self.players[self.turn]

    @property
    def last_player(self):
        self.change_turn()
        last = self.players[self.turn]
        self.change_turn()
        return last

    @property
    def color(self):
        return self.colors[self.turn]

class Connect4(Game):
    __slots__ = ("turn", "cols", "rows", "win", "NONE", "board", "new", "FOLDER", "CHANGE",
                 "previous_image", "first_time", "colors", "WIN_MESSAGE", "DRAW_MESSAGE", "GAME_TIME", "moves", "move")

    def __init__(self, ctx, second_id, cols=7, rows=6, win_requirements=4):
        super().__init__(ctx, second_id, False)
        self.turn = random.randint(1, len(second_id) + 1)
        self.cols = cols
        self.rows = rows
        self.win = win_requirements
        self.NONE = 0
        self.CHANGE = 2 ^ 1
        self.board = [[self.NONE] * rows for _ in range(cols)]
        self.new = (-1, -1)
        self.FOLDER = f"{self.ROOT}/connect_4"
        self.previous_image = None
        self.first_time = True
        self.colors = (0xfaffde, 0xfb878a)
        self.WIN_MESSAGE = "`{0}` wins Connect 4 against `{1}`!"
        self.DRAW_MESSAGE = "Looks like all the columns are full. The game ends with a draw!"
        self.GAME_TIME = "Game lasted {}"
        self.moves = {}
        self.move = 0

    def check_draw(self):
        return all(col[0] != self.NONE for col in self.board)

    def increment_move(self):
        self.move += 1
        return self.move

    def insert(self, column):
        """Insert the player color in the given column."""
        color = self.turn
        col = self.board[column]
        final_cell = 0
        if col[final_cell] != self.NONE:
            raise Connect4ColumnFull(self.players[color - 1], column + 1)

        row = col[::-1].index(self.NONE)
        row = len(col) - (row + 1)
        col[row] = color
        self.new = (column, row)
        self.moves.update({self.increment_move(): (self.current_player.id, column)})
        if self.check_draw():
            return self.draw_message()
        if self.check_for_win():
            return self.win_message()
        self.change_turn()

    def draw_message(self):
        return self.end_message(self.DRAW_MESSAGE)

    def win_message(self):
        message = self.WIN_MESSAGE.format(self.current_player, self.last_player)
        kwargs = {"color": self.color}
        return self.end_message(message, **kwargs)

    async def end_message(self, message, **kwargs):
        self.ended_at = datetime.datetime.utcnow()
        display = await self.render_board()
        file = discord.File(display, filename="connect_4.png")
        embed = BaseEmbed(timestamp=self.ended_at, **kwargs)
        embed.title = self.game
        embed.description = message
        embed.set_image(url=f"attachment://{file.filename}")
        embed.set_footer(text=self.GAME_TIME.format(precisedelta(self.ended_at - self.created_at)))
        return {"embed": embed, "file": file}

    def check_for_win(self):
        """Check the current board for a winner."""
        return get_winner(self.board, self.cols, self.rows, self.win, self.NONE)

    async def first_time_render(self):
        with Image.open(f"{self.FOLDER}/connect4_board.png") as image_board:
            # draw the player text above
            TEXT_POSITION = ((177, 54), (515, 54))
            for player, pos in zip(self.players, TEXT_POSITION):
                player_text = await render_text(player.display_name, (307, 89), 50, (255, 255, 255))
                image_board.paste(player_text, pos, mask=player_text)
        self.first_time = False
        return image_board

    async def render_board(self):
        """Renders the board, putting everything in place including text, players and the board itself"""
        if self.first_time:
            image_board = await self.first_time_render()
            self.previous_image = await to_bytes(image_board)
            return self.previous_image
        image_board = self.previous_image
        with Image.open(image_board) as image_board:
            # Actually draws the player's positions
            player_dot = tuple(f"player_{x + 1}.png" for x in range(2))
            FIRST_POSITION = 120
            INITIAL_X = 92
            INITIAL_Y = 236
            MARGIN = 3
            offset_x, offset_y = tuple(FIRST_POSITION * x for x in self.new)
            x, y = self.new
            pos = self.board[x][y] - 1
            player_resources = player_dot[pos]
            X, Y = INITIAL_X + offset_x, INITIAL_Y + offset_y
            with Image.open(f"{self.FOLDER}/{player_resources}") as image:
                image_copy = image_board.copy()
                image_copy.paste(image, (X, Y), mask=image)
                self.previous_image = await to_bytes(image_copy)
                stroke_image = await render_stroke_image(image)
                image_board.paste(stroke_image, (X - MARGIN, Y - MARGIN),
                                  mask=stroke_image)
                image_board.paste(image, (X, Y), mask=image)

        return await to_bytes(image_board)

    def change_turn(self):
        self.turn ^= self.CHANGE
        return self.turn

    @property
    def current_player(self):
        return self.players[self.turn - 1]

    @property
    def last_player(self):
        self.change_turn()
        last = self.players[self.turn - 1]
        self.change_turn()
        return last

    @property
    def color(self):
        return self.colors[self.turn - 1]


@make_async()
def to_bytes(image):
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    image.close()
    buffer.seek(0)
    return buffer


@make_async()
def render_text(text, w_h, textsize, color):
    W, H = w_h
    # creates a new Box image for the text to be drawn on with a transparency box.
    text_box = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_box)
    # declares the font
    text_font = ImageFont.truetype('resources/fonts/BebasNeue-Bold.ttf', size=textsize)

    # This auto sizes the text into the border + 20 as margin
    # This works by checking if the textsize is outside the text_box box, if it is, it will decrement by 2 until it fits
    margin = 20
    width = 0
    while draw.textsize(text, font=ImageFont.truetype('resources/fonts/BebasNeue-Bold.ttf', size=textsize))[width] + margin > W:
        textsize -= 2
        text_font = ImageFont.truetype('resources/fonts/BebasNeue-Bold.ttf', size=textsize)

    # still getting the text size, but it's for real this time
    w, h = draw.textsize(text, font=text_font)
    # The actual text is getting drawn into the image with stroke and given color
    draw.text(((W - w) / 2, (H - h) / 2), text, fill=color, font=text_font, stroke_fill=(0, 0, 0),
              stroke_width=1)
    # text_box is resized into the desired size.
    text_box.resize((W, H), Image.ANTIALIAS)
    return text_box


@make_async()
def render_stroke_image(player_dot_ind, color=(0, 99, 178)):
    """Responsible for rendering the stroke of an image"""
    old_size = player_dot_ind.size
    new_size = (old_size[0] + 50, old_size[1] + 50)

    # creates a new image which is 50 pixel bigger in 2 direction
    new_stroke = Image.new("RGB", new_size, color=color)
    new_stroke = new_stroke.resize(new_size)
    new_stroke = np.array(new_stroke)

    # A new canvas to draw
    alpha = Image.new("L", new_size, color=0)
    # draw with "L"(black and white 8 bit) mode, with the with black
    drawn_image = ImageDraw.Draw(alpha)
    drawn_image.pieslice([0, 0, new_size[0], new_size[1]], 0, 360, fill=255)

    array_np = np.array(alpha)
    combined_array = np.dstack((new_stroke, array_np))

    stroke_image = Image.fromarray(combined_array)
    stroke_image.thumbnail((old_size[0] + 6, old_size[1] + 6), resample=Image.ANTIALIAS)
    return stroke_image

#--------------------------------------------------------------------------------------------------------#

from __future__ import annotations
import discord
import datetime
import asyncio
import itertools
import numpy as np
from typing import Union
from discord.ext.commands import Context
from discord.ext import menus
from functools import partial, wraps
from io import BytesIO


async def atry_catch(func, *args, catch=Exception, ret=False, **kwargs):
    try:
        return await discord.utils.maybe_coroutine(func, *args, **kwargs)
    except catch as e:
        return e if ret else None


def try_catch(func, *args, catch=Exception, ret=False, **kwargs):
    try:
        return func(*args, **kwargs)
    except catch as e:
        return e if ret else None


class ReactionAction(menus.Menu):
    def __init__(self, reactions, target_id=None, *, timeout=60.0,  **kwargs):
        super().__init__(timeout=timeout, **kwargs)
        self.reactions = reactions
        self.create_buttons(reactions)
        self.target_id = target_id or set()

    def reaction_check(self, payload):
        if payload.message_id != self.message.id:
            return False
        if payload.user_id not in {self.bot.owner_id, *self.target_id, *self.bot.owner_ids}:
            return False
        return payload.emoji in self.buttons

    @property
    def reactions(self):
        return self._reactions

    @reactions.setter
    def reactions(self, value):
        try:
            iter(value)
        except TypeError:
            raise TypeError('invalid type for reactions: expected iterable, got {}'.format(type(value)))
        if not len(value) or len(value) > 20:
            raise ValueError(f'len(reactions) must be 0 < x <= 20: got {len(value)}')
        self._reactions = value

    def create_buttons(self, reactions):
        # override if you want button to do something different
        try:
            for index, emoji in enumerate(reactions):
                # each button calls `self.button_response(payload)` so you can do based on that
                def callback(items):
                    async def inside(self, payload):
                        await self.button_response(payload, **items)
                        self.stop()
                    return inside
                self.add_button(menus.Button(emoji, callback(reactions[emoji]), position=menus.Position(index)))
        except IndexError:
            pass

    async def button_response(self, *args, **kwargs):
        # should be overwritten for subclasses or pass
        raise NotImplementedError


class MenuPrompt(ReactionAction):
    def __init__(self, reactions, **kwargs):
        super().__init__(reactions, **kwargs)
        self.response = None

    async def button_response(self, payload, **kwargs):
        await self.message.edit(**kwargs)
        self.response = list(self.reactions).index(str(payload.emoji))

    async def finalize(self, timed_out):
        if timed_out:
            self.response = None


async def prompt(ctx, message=None, predicate=None, *, timeout=60, error="{} seconds is up",
                 event_type="message", responses=None, delete_after=False, ret=False, delete_timeout=False, target_id=None):
    bot = ctx.bot
    prompting = await ctx.send(**message or responses and responses.pop(message))
    if event_type != "reaction_add":
        respond = await atry_catch(bot.wait_for, event_type, check=predicate, timeout=timeout, ret=ret)
    else:
        menu = MenuPrompt(responses, message=prompting, delete_message_after=delete_after, check_embeds=True, target_id=target_id)
        await menu.start(ctx, wait=True)

        respond = menu.response
    if respond is None or isinstance(respond, asyncio.TimeoutError):
        content = {"content": None,
                   "embed": BaseEmbed.to_error(title="Timeout",
                                               description=error.format(timeout))}
        if not delete_timeout:
            await prompting.edit(**content)
        else:
            await prompting.delete()
            await ctx.send(**content)
        if ret:
            return respond
    else:
        return respond if event_type != "reaction_add" else not respond


async def remove_reaction_handler(message):
    bot_member = message.guild.me
    if message.guild:
        if bot_member.permissions_in(message.channel).manage_messages:
            return await atry_catch(message.clear_reactions)

    [await r.remove(bot_member) for r in message.reactions if r.me]


def make_async(executor=None):
    def wrapped(func):
        @wraps(func)
        def function(*args, **kwargs):
            thing = partial(func, *args, **kwargs)
            loop = asyncio.get_event_loop()
            return loop.run_in_executor(executor, thing)
        return function
    return wrapped


class BaseEmbed(discord.Embed):
    def __init__(self, color=0xffcccb, timestamp=datetime.datetime.utcnow(), **kwargs):
        super().__init__(color=color, timestamp=timestamp, **kwargs)

    @classmethod
    def default(cls, ctx: Union[discord.Message, Context], **kwargs) -> BaseEmbed:
        instance = cls(**kwargs)
        instance.set_footer(text=f"Requested by {ctx.author}", icon_url=ctx.author.avatar_url)
        return instance

    @classmethod
    def to_error(cls, color=discord.Color.red(), **kwargs) -> BaseEmbed:
        return cls(color=color, **kwargs)

    @classmethod
    def invite(cls, ctx, game, invited=None, status=True, invitation=None, **kwargs) -> dict:
        color = {True: ctx.bot.positive_color,
                 False: ctx.bot.error_color,
                 None: ctx.bot.color}
        status_app = {"content": None,
                      "embed":
                          cls.default(
                            ctx,
                            title=f"{game} Game invitation {ctx.bot.INVITE_REACT[status]}",
                            description=invitation or f"{invited} has {('', 'dis')[not status]}approved the invitation.",
                            color=color[status],
                                  **kwargs)
                      }
        return status_app

    @classmethod
    def board(cls, message, color, bytes_obj, file_name, **kwargs) -> dict:
        bytes_obj.seek(0)
        file = discord.File(bytes_obj, filename=f"{file_name}.png")
        embed = cls(color=color, timestamp=datetime.datetime.utcnow(), **kwargs)
        embed.set_image(url=f"attachment://{file.filename}")
        content = {"content": message,
                   "embed": embed,
                   "file": file
                   }
        return content


def get_winner(board, cols, rows, win, NONE):
    """Get the winner on the current board.
       Win algorithm was made by Patrick Westerhoff, I really like how short he made this.
    """

    # gives a generator
    def get_lines(board):
        lines = (
            board,  # columns
            zip(*board),  # rows
            diagonals_positive(board, cols, rows),  # positive diagonals
            diagonals_negative(board, cols, rows)  # negative diagonals
        )
        return itertools.chain(*lines)
    real_lines = get_lines(board)
    # Generates position
    pos_lines = get_lines(np.arange(1, rows * cols + 1).reshape(cols, rows))

    for line, pos in zip(real_lines, pos_lines):
        for color, group in itertools.groupby(line):
            if color != NONE and len(list(group)) >= win:
                return color, pos


def diagonals_positive(matrix, cols, rows):
    """Get positive diagonals, going from bottom-left to top-right."""
    for di in ([(j, i - j) for j in range(cols)] for i in range(cols + rows - 1)):
        yield [matrix[i][j] for i, j in di if 0 <= i < cols and 0 <= j < rows]


def diagonals_negative(matrix, cols, rows):
    """Get negative diagonals, going from top-left to bottom-right."""
    for di in ([(j, i - cols + j + 1) for j in range(cols)] for i in range(cols + rows - 1)):
        yield [matrix[i][j] for i, j in di if 0 <= i < cols and 0 <= j < rows]

#--------------------------------------------------------------------------------------------------------#

import discord
import re
from discord.ext import commands
from utils.converters import ValidPrefix
from utils.useful import BaseEmbed
from discord.ext.commands import BotMissingPermissions, CooldownMapping, BucketType, CommandOnCooldown


class Admin(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.global_cooldown = CooldownMapping.from_cooldown(1, 5, BucketType.user)
        self.PREFIX_UPDATE = """UPDATE prefixes 
                                SET prefixes= {}
                                WHERE snowflake_id=$1"""

    @commands.check
    async def check_perms(self, ctx):
        bucket = self.global_cooldown.get_bucket(ctx.message)
        retry_after = bucket.update_rate_limit()
        if retry_after:
            raise CommandOnCooldown(bucket, retry_after)
        if ctx.guild.me.guild_permissions.embed_links:
            return True
        raise BotMissingPermissions("embed_links")

    @commands.Cog.listener()
    async def on_message(self, message):
        if re.fullmatch("<@(!?)771054549775417344>", message.content):
            prefixes = await self.bot.get_prefix(message)
            str_prefix = "`, `".join(prefixes) if isinstance(prefixes, set) else prefixes
            return await message.channel.send(embed=BaseEmbed.default(message,
                                                                      title="Current prefix in here",
                                                                      description=f"My prefixes is `{str_prefix}`"))
        await self.bot.process_commands(message)

    @commands.group(invoke_without_command=True)
    async def prefix(self, ctx):
        prefixes = await self.bot.get_prefix(ctx.message)
        str_prefix = "`, `".join(prefixes) if isinstance(prefixes, set) else prefixes
        await ctx.send(embed=BaseEmbed.default(ctx,
                                               title="Current prefix in here",
                                               description=f"My prefixes is `{str_prefix}`"))

    @prefix.command(name="add", aliases=["+", "ad", "adds", "added"])
    async def _add(self, ctx, new_prefix: ValidPrefix):
        snowflake = ctx.guild.id if ctx.guild and ctx.author.guild_permissions.administrator else ctx.author.id
        if new_prefix not in self.bot.cache_prefix[snowflake]:
            values = (snowflake, [new_prefix])
            await self.bot.pg_con.execute(self.PREFIX_UPDATE.format("prefixes || $2"), *values)
        self.bot.cache_prefix[snowflake] = self.bot.cache_prefix[snowflake].union({new_prefix})
        prefix = "`, `".join(self.bot.cache_prefix[snowflake])
        await ctx.send(embed=BaseEmbed.default(ctx,
                                               title="Prefix Addition",
                                               description=f"Current new prefix is `{prefix}`"))

    @prefix.command(name="remove", aliases=["del", "-", "deletes", "delete", "rem", "removes", "removed"])
    async def _remove(self, ctx, del_prefix: ValidPrefix(del_mode=True)):
        snowflake = ctx.guild.id if ctx.guild and ctx.author.guild_permissions.administrator else ctx.author.id
        self.bot.cache_prefix[snowflake].discard(del_prefix)
        values = (snowflake, self.bot.cache_prefix[snowflake])
        await self.bot.pg_con.execute(self.PREFIX_UPDATE.format("$2"), *values)
        await ctx.send(embed=BaseEmbed.default(ctx,
                                               title="Prefix Deletion",
                                               description=f"Current prefix is `{'`, `'.join(self.bot.cache_prefix[snowflake])}`"))


def setup(bot):
    bot.add_cog(Admin(bot))

#--------------------------------------------------------------------------------------------------------#

import discord
import asyncio
import datetime
from discord.ext import commands
from utils.useful import prompt, BaseEmbed, atry_catch
from utils.converters import Player
from utils.errors import CurrentlyPlaying, Connect4ColumnFull
from utils import game_classes
from discord.utils import maybe_coroutine
from typing import Union


class CasualGames(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.INVITATION = "{0.mention}, **{1.author}** has invited you to play `{2}`"

    async def cog_check(self, ctx):
        # lock the user from making another game while in game or while requesting a game
        if game := ctx.bot.global_player.get_player(ctx.author.id):
            argument = f"You are currently waiting for a request of `{game}` game. You cannot request another game until this ends.", ctx.author, game
            if game.status:
                argument = f"You are currently playing `{game}`. You cannot request another game until this ends.", ctx.author, game

            raise CurrentlyPlaying(*argument)
        return True

    @commands.command()
    @commands.guild_only()
    async def connect4(self, ctx, player2: Player):
        GAME = "Connect 4"
        message = BaseEmbed.invite(ctx, GAME, status=None, invitation=self.INVITATION.format(player2, ctx, GAME))
        message["content"] = player2.mention
        responses_text = tuple(BaseEmbed.invite(ctx, GAME, status=not x, invited=player2) for x in range(2))  # first is approve, second disapprove
        responses = {ctx.bot.INVITE_REACT[1 - x]: y for x, y in zip(range(2), responses_text)}
        game = self.bot.global_player.add(ctx, [player2.id], game_classes.Connect4)
        error = f"Looks like {{}} seconds is up! Sorry **{ctx.author}**, You will have to request for another one"
        respond = await prompt(ctx, message=message, event_type="reaction_add", responses=responses, error=error,
                               target_id={player2.id})
        if not respond:
            self.bot.global_player.remove(game)
            return
        game.status = True

        def check_turn(game):
            def predicate(m):
                checking = (m.author in (game.current_player, self.bot.stella),
                            m.content.isdigit() and 1 <= int(m.content) <= game.cols)
                return all(checking)
            return predicate

        async def connect4_prompt(game, message=None):
            if not message:
                display = await game.render_board()
                player = game.current_player
                description = f"`{player}`, It's your turn. Please choose a column between `1` to `7`."
                message = BaseEmbed.board(player.mention, game.color, display, "connect_4",
                                          title="Connect 4", description=description)
            error = f"`{{}}` seconds is up. Looks like `{game.last_player}` wins"
            return await prompt(ctx, message=message, predicate=check_turn(game), error=error, delete_after=True, ret=True,
                                delete_timeout=True)

        message_sent = None
        while response := await connect4_prompt(game, message_sent):
            if isinstance(response, discord.Message):
                message_sent = None
                if game_result := await atry_catch(game.insert, int(response.content) - 1, ret=True):
                    if not isinstance(game_result, Connect4ColumnFull):
                        await ctx.send(**game_result)
                        break
                    else:
                        message_sent = {"embed": BaseEmbed.to_error(title="Connect 4",
                                                                    description=str(game_result))}
            elif isinstance(response, asyncio.TimeoutError):
                game.ended_at = datetime.datetime.utcnow()
                break
        print(game.moves)
        self.bot.global_player.remove(game)


def setup(bot):
    bot.add_cog(CasualGames(bot))

    #--------------------------------------------------------------------------------------------------------#

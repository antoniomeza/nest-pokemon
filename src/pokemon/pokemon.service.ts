import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>

  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()
    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto )
      return pokemon
    } catch (error) {
      this.handleExceptions( error )
    }

  }

  async findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto
    
    return await this.pokemonModel.find()
      .limit( limit )
      .skip( offset )
      .sort({
        no: 1
      })
      .select('-__v')
  }

  async findOne( id: string) {
    
    let pokemon: Pokemon

    // NO
    if ( !isNaN( +id )) {
      pokemon = await this.pokemonModel.findOne( { no: id } )
    }

    // ID
    if ( !pokemon && isValidObjectId( id ) ) {
      pokemon = await this.pokemonModel.findById( id )
    }

    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: id.toLocaleLowerCase().trim() })
    }

    if ( !pokemon ) throw new NotFoundException(`Pokemon with id, name or no "${ id }" not found` )

    return pokemon
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne( id )
    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase()
    
    try {
      await pokemon.updateOne( updatePokemonDto, { new: true })
      return { ...pokemon.toJSON(), ...updatePokemonDto }
    } catch (error) {
      this.handleExceptions( error )
    }



  }

  async remove(id: string) {
    // Eliminación normal
      // const pokemon = await this.findOne( id )
      // await pokemon.deleteOne()
    // Directa sin validar ID
      // const result = await this.pokemonModel.findByIdAndDelete( id )

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })
    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${ id }" not found`)
    return
  }

  private handleExceptions( error: any ) {
    if ( error.code === 11000 ) {
      throw new BadRequestException(`Pokemon exist in DB ${ JSON.stringify( error.keyValue ) }`)
    }
    console.log( error )
    throw new InternalServerErrorException('Cant create Pokemon - Check server logs')
  }
}

/* eslint-disable */
import { Post } from "src/post/entities/post.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column({type: 'int', default: 1})
    status: number

    @CreateDateColumn()
    created_at: Date

    @CreateDateColumn()
    update_at: Date

    @OneToMany(() => Post, (post) => post.category)
    posts: Post[]
}

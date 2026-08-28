import { Entity, PrimaryGeneratedColumn, Column,ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.js";

@Entity("grocery_items")
export class GroceryItem {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        name: "user_id",
        type: "int"
    })
    userId!: number;

    @Column({
        type: "varchar",
        length: 255
    })
    name!: string;

    @Column({
        type: "boolean",
        default: false
    })
    completed!: boolean;

    @Column({
        type: "boolean",
        default: false
    })
    custom!: boolean;

    @ManyToOne(() => User, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user!: User;
}
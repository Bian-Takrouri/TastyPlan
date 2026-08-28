import {Entity,PrimaryGeneratedColumn,Column} from "typeorm";

@Entity("categories")
export class Category {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 100, unique: true })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({
        name: "image_url",
        type: "varchar",
        length: 500,
        nullable: true
    })
    imageUrl!: string | null;
}
